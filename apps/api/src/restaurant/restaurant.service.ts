import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql, desc, asc, count, ilike, or } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  restaurantsTable,
  type NewRestaurantsTable,
} from '../db/schema/restaurant.schema';
import { CreateRestaurantDto, CuisineType } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import * as schema from '../db/schema';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { RestaurantResponseDto } from './dto/restarurant-response.dto';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { UserRole } from '@food_delivery/types';
import { CacheService } from '../redis/cache.service';
import { RestaurantStatsDto } from './dto/restaurant-stats.dto';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);
  // Professional TTLs: lists short (frequent writes/filters), entities longer
  private readonly LIST_TTL = 60; // 1 min
  private readonly ENTITY_TTL = 300; // 5 min
  private readonly OWNER_TTL = 120; // 2 min

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly cache: CacheService,
  ) {}

  // ─── CACHE KEYS ───
  private keyList(hash: string) {
    return `restaurant:list:${hash}`;
  }
  private keyId(id: string) {
    return `restaurant:id:${id}`;
  }
  private keySlug(slug: string) {
    return `restaurant:slug:${slug}`;
  }
  private keyOwner(ownerId: string) {
    return `restaurant:owner:${ownerId}`;
  }

  private async invalidateRestaurant(opts: {
    id?: string;
    slug?: string;
    ownerId?: string;
  }): Promise<void> {
    const ops: Promise<void>[] = [this.cache.delByPattern('restaurant:list:*')];
    if (opts.id) ops.push(this.cache.del(this.keyId(opts.id)));
    if (opts.slug) ops.push(this.cache.del(this.keySlug(opts.slug)));
    if (opts.ownerId) ops.push(this.cache.del(this.keyOwner(opts.ownerId)));
    // slug cache depends on id too — blow all slug keys when id changes (cheap via pattern)
    if (opts.id) ops.push(this.cache.delByPattern('restaurant:slug:*'));
    await Promise.all(ops);
  }

  /**
   * Owners may only mutate their own restaurants.
   * Admins bypass this check (role is already enforced by @Roles).
   */
  private assertOwnership(
    restaurant: Pick<RestaurantResponseDto, 'ownerId'>,
    user: JwtPayload,
  ): void {
    if (user.role === UserRole.ADMIN) return;
    if (restaurant.ownerId !== user.sub) {
      throw new ForbiddenException(
        'You do not have permission to manage this restaurant',
      );
    }
  }

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`[${context}] Error:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  private extractPublicId(url: string): string | null {
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;
      const pathParts = parts.slice(uploadIndex + 2);
      const filename = pathParts.join('/');
      return filename.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }

  // ─── AVAILABLE CUISINE TYPES ───
  getCuisines(): string[] {
    return Object.values(CuisineType);
  }

  // ─── CREATE ───
  async create(
    ownerId: string,
    dto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      const existing = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.slug, dto.slug),
      });
      if (existing) {
        throw new ConflictException('Restaurant with this slug already exists');
      }

      const [restaurant] = await this.db
        .insert(restaurantsTable)
        .values({
          ownerId,
          name: dto.name,
          slug: dto.slug,
          description: dto.description,
          phone: dto.phone,
          email: dto.email,
          address: dto.address,
          wardNumber: dto.wardNumber,
          latitude: dto.latitude,
          longitude: dto.longitude,
          cuisineType: dto.cuisineType,
          openingTime: dto.openingTime,
          closingTime: dto.closingTime,
          isOpen: dto.isOpen ?? false,
          isActive: true,
          isVerified: false,
          deliveryFee: dto.deliveryFee?.toString() || '0.00',
          minimumOrderAmount: dto.minimumOrderAmount?.toString() || '0.00',
          estimatedDeliveryTime: dto.estimatedDeliveryTime,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!restaurant) {
        throw new InternalServerErrorException('Failed to create restaurant');
      }

      await this.invalidateRestaurant({ ownerId });
      this.logger.log(
        `Restaurant created: ${restaurant.name} (ID: ${restaurant.id})`,
      );
      return restaurant as unknown as RestaurantResponseDto;
    }, 'create');
  }

  // ─── FIND ALL ─── (cached — cache-aside, fail-open)
  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      cuisineType?: string;
      isOpen?: boolean;
      isVerified?: boolean;
      isActive?: boolean;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<{
    data: RestaurantResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    // Normalize for deterministic cache key
    const normalized = {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      search: options.search ?? '',
      cuisineType: options.cuisineType ?? '',
      isOpen: options.isOpen,
      isVerified: options.isVerified,
      isActive: options.isActive,
      sortBy: options.sortBy ?? 'createdAt',
      sortOrder: options.sortOrder ?? 'DESC',
    };
    const hash = CacheService.hashOptions(normalized);
    const cacheKey = this.keyList(hash);

    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.LIST_TTL, async () => {
        const {
          page = 1,
          limit = 10,
          search,
          cuisineType,
          isOpen,
          isVerified,
          isActive,
          sortBy = 'createdAt',
          sortOrder = 'DESC',
        } = options;

        if (page < 1) throw new BadRequestException('Page must be at least 1');
        if (limit < 1 || limit > 100) throw new BadRequestException('Limit must be between 1 and 100');

        const allowedSort: Record<string, any> = {
          createdAt: restaurantsTable.createdAt,
          updatedAt: restaurantsTable.updatedAt,
          name: restaurantsTable.name,
          averageRating: restaurantsTable.averageRating,
          deliveryFee: restaurantsTable.deliveryFee,
        };
        const sortCol = allowedSort[sortBy] ?? restaurantsTable.createdAt;
        const orderFn = sortOrder.toUpperCase() === 'ASC' ? asc(sortCol) : desc(sortCol);

        const conditions: any[] = [sql`${restaurantsTable.deletedAt} IS NULL`];

        if (search && search.trim()) {
          const term = `%${search.trim()}%`;
          conditions.push(
            or(
              ilike(restaurantsTable.name, term),
              ilike(restaurantsTable.description, term),
              ilike(restaurantsTable.address, term),
              ilike(restaurantsTable.slug, term),
            ),
          );
        }
        if (cuisineType)
          conditions.push(eq(restaurantsTable.cuisineType, cuisineType));
        if (isOpen !== undefined)
          conditions.push(eq(restaurantsTable.isOpen, isOpen));
        if (isVerified !== undefined)
          conditions.push(eq(restaurantsTable.isVerified, isVerified));
        if (isActive !== undefined)
          conditions.push(eq(restaurantsTable.isActive, isActive));

        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const [countResult] = await this.db
          .select({ total: count() })
          .from(restaurantsTable)
          .where(whereClause);

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const restaurants = await this.db
          .select()
          .from(restaurantsTable)
          .where(whereClause)
          .orderBy(orderFn)
          .limit(limit)
          .offset(offset);

        return {
          data: restaurants as unknown as RestaurantResponseDto[],
          total,
          page,
          limit,
          totalPages,
        };
      });
    }, 'findAll');
  }

  // ─── FIND BY ID ─── (cached)
  async findById(id: string): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyId(id), this.ENTITY_TTL, async () => {
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: and(
            eq(restaurantsTable.id, id),
            sql`${restaurantsTable.deletedAt} IS NULL`,
          ),
        });
        if (!restaurant) {
          throw new NotFoundException(`Restaurant with ID ${id} not found`);
        }
        return restaurant as unknown as RestaurantResponseDto;
      });
    }, 'findById');
  }

  // ─── FIND BY SLUG ─── (cached)
  async findBySlug(slug: string): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keySlug(slug), this.ENTITY_TTL, async () => {
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: and(
            eq(restaurantsTable.slug, slug),
            sql`${restaurantsTable.deletedAt} IS NULL`,
          ),
        });
        if (!restaurant) {
          throw new NotFoundException(`Restaurant with slug ${slug} not found`);
        }
        return restaurant as unknown as RestaurantResponseDto;
      });
    }, 'findBySlug');
  }

  // ─── FIND BY OWNER ─── (cached)
  async findByOwner(ownerId: string): Promise<RestaurantResponseDto[]> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(
        this.keyOwner(ownerId),
        this.OWNER_TTL,
        async () => {
          const restaurants = await this.db.query.restaurantsTable.findMany({
            where: and(
              eq(restaurantsTable.ownerId, ownerId),
              sql`${restaurantsTable.deletedAt} IS NULL`,
            ),
            orderBy: [desc(restaurantsTable.createdAt)],
          });
          return restaurants as unknown as RestaurantResponseDto[];
        },
      );
    }, 'findByOwner');
  }

  // ─── UPDATE ───
  async update(
    id: string,
    user: JwtPayload,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
      this.assertOwnership(restaurant, user);

      if (dto.slug && dto.slug !== restaurant.slug) {
        const existing = await this.db.query.restaurantsTable.findFirst({
          where: eq(restaurantsTable.slug, dto.slug),
        });
        if (existing) {
          throw new ConflictException(
            'Restaurant with this slug already exists',
          );
        }
      }

      const updateData: any = { ...dto, updatedAt: new Date() };
      if (dto.deliveryFee !== undefined)
        updateData.deliveryFee = dto.deliveryFee.toString();
      if (dto.minimumOrderAmount !== undefined)
        updateData.minimumOrderAmount = dto.minimumOrderAmount.toString();

      const [updated] = await this.db
        .update(restaurantsTable)
        .set(updateData)
        .where(eq(restaurantsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update restaurant');
      }

      await this.invalidateRestaurant({
        id,
        slug: updated.slug,
        ownerId: updated.ownerId,
      });
      this.logger.log(`Restaurant updated: ${updated.name} (ID: ${id})`);
      return updated as unknown as RestaurantResponseDto;
    }, 'update');
  }

  // ─── UPLOAD IMAGES ───
  async uploadImages(
    restaurantId: string,
    user: JwtPayload,
    logoFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);
      this.assertOwnership(restaurant, user);

      let logoUrl = restaurant.logoUrl;
      let coverImageUrl = restaurant.coverImageUrl;

      if (logoFile) {
        const result = await this.cloudinaryService.uploadImage(
          logoFile,
          `khanago/restaurants/${restaurantId}/logo`,
        );
        logoUrl = result.url;
      }

      if (coverFile) {
        const result = await this.cloudinaryService.uploadImage(
          coverFile,
          `khanago/restaurants/${restaurantId}/cover`,
        );
        coverImageUrl = result.url;
      }

      await this.db
        .update(restaurantsTable)
        .set({ logoUrl, coverImageUrl, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, restaurantId));

      await this.invalidateRestaurant({
        id: restaurantId,
        ownerId: restaurant.ownerId,
      });
      this.logger.log(`Images uploaded for restaurant: ${restaurantId}`);
      return { logoUrl, coverImageUrl };
    }, 'uploadImages');
  }

  // ─── UPDATE IMAGES ───
  async updateImages(
    restaurantId: string,
    user: JwtPayload,
    logoFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);
      this.assertOwnership(restaurant, user);

      let logoUrl = restaurant.logoUrl;
      let coverImageUrl = restaurant.coverImageUrl;

      if (logoFile) {
        if (restaurant.logoUrl) {
          const publicId = this.extractPublicId(restaurant.logoUrl);
          if (publicId) await this.cloudinaryService.deleteImage(publicId);
        }
        const result = await this.cloudinaryService.uploadImage(
          logoFile,
          `khanago/restaurants/${restaurantId}/logo`,
        );
        logoUrl = result.url;
      }

      if (coverFile) {
        if (restaurant.coverImageUrl) {
          const publicId = this.extractPublicId(restaurant.coverImageUrl);
          if (publicId) await this.cloudinaryService.deleteImage(publicId);
        }
        const result = await this.cloudinaryService.uploadImage(
          coverFile,
          `khanago/restaurants/${restaurantId}/cover`,
        );
        coverImageUrl = result.url;
      }

      await this.db
        .update(restaurantsTable)
        .set({ logoUrl, coverImageUrl, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, restaurantId));

      await this.invalidateRestaurant({
        id: restaurantId,
        ownerId: restaurant.ownerId,
      });
      this.logger.log(`Images updated for restaurant: ${restaurantId}`);
      return { logoUrl, coverImageUrl };
    }, 'updateImages');
  }

  // ─── DELETE IMAGE ───
  async deleteImage(
    restaurantId: string,
    user: JwtPayload,
    imageType: 'logo' | 'cover',
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);
      this.assertOwnership(restaurant, user);

      const imageUrl =
        imageType === 'logo' ? restaurant.logoUrl : restaurant.coverImageUrl;
      if (!imageUrl) {
        throw new BadRequestException(`No ${imageType} image found`);
      }

      const publicId = this.extractPublicId(imageUrl);
      if (publicId) {
        await this.cloudinaryService.deleteImage(publicId);
      }

      const updateData =
        imageType === 'logo' ? { logoUrl: null } : { coverImageUrl: null };

      await this.db
        .update(restaurantsTable)
        .set({ ...updateData, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, restaurantId));

      await this.invalidateRestaurant({
        id: restaurantId,
        ownerId: restaurant.ownerId,
      });
      return { message: `${imageType} image deleted successfully` };
    }, 'deleteImage');
  }

  // ─── TOGGLE OPEN ───
  async toggleOpen(id: string, user: JwtPayload): Promise<{ isOpen: boolean }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
      this.assertOwnership(restaurant, user);
      const [updated] = await this.db
        .update(restaurantsTable)
        .set({ isOpen: !restaurant.isOpen, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException(
          'Failed to toggle restaurant status',
        );
      }

      await this.invalidateRestaurant({ id, ownerId: restaurant.ownerId });
      this.logger.log(`Restaurant ${id} open status: ${updated.isOpen}`);
      return { isOpen: updated.isOpen };
    }, 'toggleOpen');
  }

  // ─── TOGGLE VERIFICATION ───
  async toggleVerification(id: string): Promise<{ isVerified: boolean }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
      const [updated] = await this.db
        .update(restaurantsTable)
        .set({ isVerified: !restaurant.isVerified, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException(
          'Failed to toggle verification status',
        );
      }

      await this.invalidateRestaurant({
        id,
        slug: restaurant.slug,
        ownerId: restaurant.ownerId,
      });
      this.logger.log(
        `Restaurant ${id} verification status: ${updated.isVerified}`,
      );
      return { isVerified: updated.isVerified };
    }, 'toggleVerification');
  }

  // ─── SOFT DELETE ───
  async delete(id: string, user: JwtPayload): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
      this.assertOwnership(restaurant, user);
      await this.db
        .update(restaurantsTable)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(restaurantsTable.id, id));

      await this.invalidateRestaurant({
        id,
        slug: restaurant.slug,
        ownerId: restaurant.ownerId,
      });
      this.logger.log(`Restaurant soft deleted: ${id}`);
      return { message: 'Restaurant deleted successfully' };
    }, 'delete');
  }

  // ─── RESTORE ───
  async restore(id: string): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      const [restored] = await this.db
        .update(restaurantsTable)
        .set({ deletedAt: null, updatedAt: new Date() })
        .where(
          and(
            eq(restaurantsTable.id, id),
            sql`${restaurantsTable.deletedAt} IS NOT NULL`,
          ),
        )
        .returning();

      if (!restored) {
        throw new NotFoundException(
          `Restaurant with ID ${id} not found or not deleted`,
        );
      }

      await this.invalidateRestaurant({
        id,
        slug: restored.slug,
        ownerId: restored.ownerId,
      });
      this.logger.log(`Restaurant restored: ${restored.name} (ID: ${id})`);
      return restored as unknown as RestaurantResponseDto;
    }, 'restore');
  }

  // ─── TOGGLE ACTIVE ───
  async toggleActive(id: string): Promise<{ isActive: boolean }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
      const [updated] = await this.db
        .update(restaurantsTable)
        .set({ isActive: !restaurant.isActive, updatedAt: new Date() })
        .where(eq(restaurantsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException(
          'Failed to toggle active status',
        );
      }

      await this.invalidateRestaurant({ id, ownerId: restaurant.ownerId });
      this.logger.log(`Restaurant ${id} active status: ${updated.isActive}`);
      return { isActive: updated.isActive };
    }, 'toggleActive');
  }

  // ─── FIND DELETED (Admin) ───
  async findDeleted(options: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: RestaurantResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.handleDbOperation(async () => {
      const { page = 1, limit = 10, search } = options;
      const conditions: any[] = [sql`${restaurantsTable.deletedAt} IS NOT NULL`];
      if (search && search.trim()) {
        const term = `%${search.trim()}%`;
        conditions.push(or(ilike(restaurantsTable.name, term), ilike(restaurantsTable.address, term)));
      }
      const whereClause = and(...conditions);
      const [countResult] = await this.db.select({ total: count() }).from(restaurantsTable).where(whereClause);
      const total = countResult?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const rows = await this.db
        .select()
        .from(restaurantsTable)
        .where(whereClause)
        .orderBy(desc(restaurantsTable.deletedAt))
        .limit(limit)
        .offset(offset);
      return { data: rows as unknown as RestaurantResponseDto[], total, page, limit, totalPages };
    }, 'findDeleted');
  }

  // ─── HARD DELETE (Admin) ───
  async hardDelete(id: string): Promise<void> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, id),
      });
      if (!restaurant) throw new NotFoundException(`Restaurant with ID ${id} not found`);
      // cleanup cloudinary best effort
      if (restaurant.logoUrl) {
        const pid = this.extractPublicId(restaurant.logoUrl);
        if (pid) await this.cloudinaryService.deleteImage(pid).catch(() => {});
      }
      if (restaurant.coverImageUrl) {
        const pid = this.extractPublicId(restaurant.coverImageUrl);
        if (pid) await this.cloudinaryService.deleteImage(pid).catch(() => {});
      }
      await this.db.delete(restaurantsTable).where(eq(restaurantsTable.id, id));
      await this.invalidateRestaurant({ id, slug: restaurant.slug, ownerId: restaurant.ownerId });
      this.logger.log(`Restaurant hard deleted: ${id}`);
    }, 'hardDelete');
  }

  // ─── GET STATS ───
  async getStats(): Promise<RestaurantStatsDto> {
    return this.handleDbOperation(async () => {
      const [totalResult] = await this.db
        .select({ total: count() })
        .from(restaurantsTable)
        .where(sql`${restaurantsTable.deletedAt} IS NULL`);

      const [activeResult] = await this.db
        .select({ active: count() })
        .from(restaurantsTable)
        .where(
          and(
            eq(restaurantsTable.isActive, true),
            sql`${restaurantsTable.deletedAt} IS NULL`,
          ),
        );

      const [verifiedResult] = await this.db
        .select({ verified: count() })
        .from(restaurantsTable)
        .where(
          and(
            eq(restaurantsTable.isVerified, true),
            sql`${restaurantsTable.deletedAt} IS NULL`,
          ),
        );

      const [openResult] = await this.db
        .select({ open: count() })
        .from(restaurantsTable)
        .where(
          and(
            eq(restaurantsTable.isOpen, true),
            sql`${restaurantsTable.deletedAt} IS NULL`,
          ),
        );

      const [deletedResult] = await this.db
        .select({ deleted: count() })
        .from(restaurantsTable)
        .where(sql`${restaurantsTable.deletedAt} IS NOT NULL`);

      return {
        total: totalResult?.total || 0,
        active: activeResult?.active || 0,
        inactive: (totalResult?.total || 0) - (activeResult?.active || 0),
        verified: verifiedResult?.verified || 0,
        unverified: (totalResult?.total || 0) - (verifiedResult?.verified || 0),
        open: openResult?.open || 0,
        closed: (totalResult?.total || 0) - (openResult?.open || 0),
        deleted: deletedResult?.deleted || 0,
      };
    }, 'getStats');
  }
}
