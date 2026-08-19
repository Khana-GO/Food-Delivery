import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql, desc, count } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  restaurantsTable,
  type NewRestaurantsTable,
} from '../db/schema/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import * as schema from '../db/schema';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { RestaurantResponseDto } from './dto/restarurant-response.dto';

@Injectable()
export class RestaurantsService {
  private readonly logger = new Logger(RestaurantsService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

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

      this.logger.log(
        `Restaurant created: ${restaurant.name} (ID: ${restaurant.id})`,
      );
      return restaurant as unknown as RestaurantResponseDto;
    }, 'create');
  }

  // ─── FIND ALL ───
  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      cuisineType?: string;
      isOpen?: boolean;
      isVerified?: boolean;
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
    return this.handleDbOperation(async () => {
      const {
        page = 1,
        limit = 10,
        search,
        cuisineType,
        isOpen,
        isVerified,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = options;

      const conditions: any[] = [sql`${restaurantsTable.deletedAt} IS NULL`];

      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          sql`${restaurantsTable.name} ILIKE ${searchTerm} OR ${restaurantsTable.description} ILIKE ${searchTerm}`,
        );
      }
      if (cuisineType)
        conditions.push(eq(restaurantsTable.cuisineType, cuisineType));
      if (isOpen !== undefined)
        conditions.push(eq(restaurantsTable.isOpen, isOpen));
      if (isVerified !== undefined)
        conditions.push(eq(restaurantsTable.isVerified, isVerified));

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
        .orderBy(
          sql`${restaurantsTable[sortBy as keyof typeof restaurantsTable]} ${sql.raw(sortOrder)}`,
        )
        .limit(limit)
        .offset(offset);

      return {
        data: restaurants as unknown as RestaurantResponseDto[],
        total,
        page,
        limit,
        totalPages,
      };
    }, 'findAll');
  }

  // ─── FIND BY ID ───
  async findById(id: string): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
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
    }, 'findById');
  }

  // ─── FIND BY SLUG ───
  async findBySlug(slug: string): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
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
    }, 'findBySlug');
  }

  // ─── FIND BY OWNER ───
  async findByOwner(ownerId: string): Promise<RestaurantResponseDto[]> {
    return this.handleDbOperation(async () => {
      const restaurants = await this.db.query.restaurantsTable.findMany({
        where: and(
          eq(restaurantsTable.ownerId, ownerId),
          sql`${restaurantsTable.deletedAt} IS NULL`,
        ),
        orderBy: [desc(restaurantsTable.createdAt)],
      });
      return restaurants as unknown as RestaurantResponseDto[];
    }, 'findByOwner');
  }

  // ─── UPDATE ───
  async update(
    id: string,
    dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);

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

      this.logger.log(`Restaurant updated: ${updated.name} (ID: ${id})`);
      return updated as unknown as RestaurantResponseDto;
    }, 'update');
  }

  // ─── UPLOAD IMAGES ───
  async uploadImages(
    restaurantId: string,
    logoFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);

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

      this.logger.log(`Images uploaded for restaurant: ${restaurantId}`);
      return { logoUrl, coverImageUrl };
    }, 'uploadImages');
  }

  // ─── UPDATE IMAGES ───
  async updateImages(
    restaurantId: string,
    logoFile?: Express.Multer.File,
    coverFile?: Express.Multer.File,
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);

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

      this.logger.log(`Images updated for restaurant: ${restaurantId}`);
      return { logoUrl, coverImageUrl };
    }, 'updateImages');
  }

  // ─── DELETE IMAGE ───
  async deleteImage(
    restaurantId: string,
    imageType: 'logo' | 'cover',
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(restaurantId);

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

      return { message: `${imageType} image deleted successfully` };
    }, 'deleteImage');
  }

  // ─── TOGGLE OPEN ───
  async toggleOpen(id: string): Promise<{ isOpen: boolean }> {
    return this.handleDbOperation(async () => {
      const restaurant = await this.findById(id);
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

      this.logger.log(
        `Restaurant ${id} verification status: ${updated.isVerified}`,
      );
      return { isVerified: updated.isVerified };
    }, 'toggleVerification');
  }

  // ─── SOFT DELETE ───
  async delete(id: string): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      await this.findById(id);
      await this.db
        .update(restaurantsTable)
        .set({ deletedAt: new Date(), updatedAt: new Date() })
        .where(eq(restaurantsTable.id, id));

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

      this.logger.log(`Restaurant restored: ${restored.name} (ID: ${id})`);
      return restored as unknown as RestaurantResponseDto;
    }, 'restore');
  }
}
