import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { eq, and, or, ilike, desc, asc, sql, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import {
  menuItemsTable,
  menuCategoriesTable,
  restaurantsTable,
  type MenuItem,
  type NewMenuItem,
} from '../db/schema';
import type * as schema from '../db/schema';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';
import { UpdateMenuItemDto } from './dto/update-menu.dto';
import { NotificationsService } from '../notification/notification.service';
import { CacheService } from '../redis/cache.service';

const SORTABLE_COLUMNS = ['createdAt', 'updatedAt', 'name', 'price'] as const;

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);
  private readonly LIST_TTL = 60;
  private readonly ENTITY_TTL = 300;
  private readonly GROUPED_TTL = 60;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
    private readonly cache: CacheService,
  ) {}

  // ─── CACHE KEYS & INVALIDATION ───
  private keyItem(id: string) {
    return `menu:item:${id}`;
  }
  private keyList(restaurantId: string, hash: string) {
    return `menu:restaurant:${restaurantId}:list:${hash}`;
  }
  private keyByCategory(categoryId: string, isAvailable?: boolean) {
    return `menu:category:${categoryId}:available:${isAvailable ?? 'all'}`;
  }
  private keyGrouped(restaurantId: string) {
    return `menu:grouped:${restaurantId}`;
  }
  private async invalidateMenu(
    restaurantId: string,
    categoryId?: string,
    itemId?: string,
  ) {
    const ops: Promise<void>[] = [
      this.cache.delByPattern(`menu:restaurant:${restaurantId}:*`),
      this.cache.del(this.keyGrouped(restaurantId)),
    ];
    if (categoryId)
      ops.push(
        this.cache.del(this.keyByCategory(categoryId)),
        this.cache.del(this.keyByCategory(categoryId, true)),
        this.cache.del(this.keyByCategory(categoryId, false)),
      );
    if (itemId) ops.push(this.cache.del(this.keyItem(itemId)));
    // Category-level listings share category id — blow all variants
    if (categoryId)
      ops.push(this.cache.delByPattern(`menu:category:${categoryId}:*`));
    await Promise.all(ops);
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
        error instanceof BadRequestException ||
        error instanceof ForbiddenException ||
        error instanceof InternalServerErrorException
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

  /**
   * Resolves the owner's default (oldest active) restaurant. Used when the
   * client does not explicitly pick which of their restaurants to manage.
   */
  async getRestaurantIdForUser(userId: string): Promise<string> {
    const [restaurant] = await this.db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(
        and(
          eq(restaurantsTable.ownerId, userId),
          isNull(restaurantsTable.deletedAt),
        ),
      )
      .orderBy(asc(restaurantsTable.createdAt))
      .limit(1);

    if (!restaurant) {
      throw new BadRequestException('You do not have a restaurant registered');
    }

    return restaurant.id;
  }

  /**
   * Verifies the user owns the given restaurant and returns its id.
   * Used when an owner with multiple restaurants explicitly selects one.
   */
  async getOwnedRestaurantId(
    userId: string,
    restaurantId: string,
  ): Promise<string> {
    const [restaurant] = await this.db
      .select({ id: restaurantsTable.id })
      .from(restaurantsTable)
      .where(
        and(
          eq(restaurantsTable.id, restaurantId),
          eq(restaurantsTable.ownerId, userId),
          isNull(restaurantsTable.deletedAt),
        ),
      )
      .limit(1);

    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return restaurant.id;
  }

  /**
   * Ensures the menu item belongs to a restaurant owned by the requesting user.
   * Multi-restaurant aware: any owned restaurant is allowed. Admins bypass.
   */
  private async assertOwnershipByUser(
    itemRestaurantId: string,
    ownerUserId?: string,
  ): Promise<void> {
    if (!ownerUserId) return; // admin bypass
    const owned = await this.db.query.restaurantsTable.findFirst({
      where: and(
        eq(restaurantsTable.id, itemRestaurantId),
        eq(restaurantsTable.ownerId, ownerUserId),
        isNull(restaurantsTable.deletedAt),
      ),
    });
    if (!owned) {
      throw new ForbiddenException(
        'You do not have permission to manage this menu item',
      );
    }
  }

  /**
   * @deprecated Use assertOwnershipByUser for multi-restaurant support
   */
  private assertOwnership(
    itemRestaurantId: string,
    ownerRestaurantId?: string,
  ): void {
    if (ownerRestaurantId && itemRestaurantId !== ownerRestaurantId) {
      throw new ForbiddenException(
        'You do not have permission to manage this menu item',
      );
    }
  }

  /**
   * Ensures the category belongs to the same restaurant as the menu item,
   * so an owner can never attach items to another restaurant's category.
   */
  private async assertCategoryInRestaurant(
    categoryId: string,
    restaurantId: string,
  ): Promise<void> {
    const category = await this.db.query.menuCategoriesTable.findFirst({
      where: eq(menuCategoriesTable.id, categoryId),
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }

    if (category.restaurantId !== restaurantId) {
      throw new BadRequestException(
        'The selected category does not belong to your restaurant',
      );
    }
  }

  /** Fetches the raw row or throws NotFound. */
  private async getRawItem(id: string): Promise<MenuItem> {
    const item = await this.db.query.menuItemsTable.findFirst({
      where: eq(menuItemsTable.id, id),
    });

    if (!item) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return item;
  }

  // ─── CREATE ───
  async create(
    restaurantId: string,
    dto: CreateMenuItemDto,
    file?: Express.Multer.File,
    ownerUserId?: string,
  ): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      await this.assertCategoryInRestaurant(dto.categoryId, restaurantId);

      let imageUrl: string | undefined;

      if (file) {
        const result = await this.cloudinaryService.uploadImage(
          file,
          `khanago/menu-items/${restaurantId}`,
        );
        imageUrl = result.url;
      }

      const values: NewMenuItem = {
        restaurantId,
        categoryId: dto.categoryId,
        name: dto.name,
        description: dto.description,
        price: dto.price.toString(),
        imageUrl: imageUrl ?? dto.imageUrl,
        isAvailable: dto.isAvailable ?? true,
      };

      const [item] = await this.db
        .insert(menuItemsTable)
        .values(values)
        .returning();

      if (!item) {
        throw new InternalServerErrorException('Failed to create menu item');
      }

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Menu item created',
            body: `"${item.name}" has been added to your menu.`,
            data: {
              restaurantId,
              menuItemId: item.id,
              itemName: item.name,
              price: item.price,
              categoryId: item.categoryId,
            },
          })
          .catch((err) =>
            this.logger.warn(
              `Failed to create notification for menu create: ${err?.message}`,
            ),
          );
      }

      await this.invalidateMenu(restaurantId, dto.categoryId);
      this.logger.log(`Menu item created: ${item.name} (ID: ${item.id})`);
      return new MenuItemResponseDto(item);
    }, 'create');
  }

  // ─── FIND ALL (By Restaurant) ─── (cached)
  async findByRestaurant(
    restaurantId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      isAvailable?: boolean;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<{
    data: MenuItemResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const hash = CacheService.hashOptions({
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      search: options.search ?? '',
      categoryId: options.categoryId ?? '',
      isAvailable: options.isAvailable,
      sortBy: options.sortBy ?? 'createdAt',
      sortOrder: options.sortOrder ?? 'DESC',
    });
    const cacheKey = this.keyList(restaurantId, hash);

    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.LIST_TTL, async () => {
        const {
          page = 1,
          limit = 10,
          search,
          categoryId,
          isAvailable,
          sortBy = 'createdAt',
          sortOrder = 'DESC',
        } = options;

        const safeSortBy = (SORTABLE_COLUMNS as readonly string[]).includes(
          sortBy,
        )
          ? sortBy
          : 'createdAt';
        const sortColumn = menuItemsTable[
          safeSortBy as keyof typeof menuItemsTable
        ] as never;

        const conditions = [eq(menuItemsTable.restaurantId, restaurantId)];

        if (search) {
          const searchTerm = `%${search}%`;
          conditions.push(
            or(
              ilike(menuItemsTable.name, searchTerm),
              ilike(menuItemsTable.description, searchTerm),
            )!,
          );
        }

        if (categoryId) {
          conditions.push(eq(menuItemsTable.categoryId, categoryId));
        }

        if (isAvailable !== undefined) {
          conditions.push(eq(menuItemsTable.isAvailable, isAvailable));
        }

        const whereClause = and(...conditions);

        const [countResult] = await this.db
          .select({ total: sql<number>`count(*)` })
          .from(menuItemsTable)
          .where(whereClause);

        const total = Number(countResult?.total ?? 0);
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const items = await this.db
          .select()
          .from(menuItemsTable)
          .where(whereClause)
          .orderBy(sortOrder === 'ASC' ? asc(sortColumn) : desc(sortColumn))
          .limit(limit)
          .offset(offset);

        return {
          data: items.map((item) => new MenuItemResponseDto(item)),
          total,
          page,
          limit,
          totalPages,
        };
      });
    }, 'findByRestaurant');
  }

  // ─── FIND ALL (By Category) ─── (cached)
  async findByCategory(
    categoryId: string,
    isAvailable?: boolean,
  ): Promise<MenuItemResponseDto[]> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(
        this.keyByCategory(categoryId, isAvailable),
        this.LIST_TTL,
        async () => {
          const conditions = [eq(menuItemsTable.categoryId, categoryId)];

          if (isAvailable !== undefined) {
            conditions.push(eq(menuItemsTable.isAvailable, isAvailable));
          }

          const items = await this.db
            .select()
            .from(menuItemsTable)
            .where(and(...conditions))
            .orderBy(desc(menuItemsTable.createdAt));

          return items.map((item) => new MenuItemResponseDto(item));
        },
      );
    }, 'findByCategory');
  }

  // ─── FIND BY ID ─── (cached)
  async findById(id: string): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyItem(id), this.ENTITY_TTL, async () => {
        const item = await this.getRawItem(id);
        return new MenuItemResponseDto(item);
      });
    }, 'findById');
  }

  // ─── UPDATE ───
  async update(
    id: string,
    dto: UpdateMenuItemDto,
    file?: Express.Multer.File,
    ownerUserId?: string,
  ): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      const existing = await this.getRawItem(id);
      await this.assertOwnershipByUser(existing.restaurantId, ownerUserId);

      if (dto.categoryId && dto.categoryId !== existing.categoryId) {
        await this.assertCategoryInRestaurant(
          dto.categoryId,
          existing.restaurantId,
        );
      }

      let imageUrl: string | undefined = existing.imageUrl ?? undefined;
      let previousImageUrl: string | undefined;

      if (file) {
        const result = await this.cloudinaryService.uploadImage(
          file,
          `khanago/menu-items/${existing.restaurantId}`,
        );
        imageUrl = result.url;
        previousImageUrl = existing.imageUrl ?? undefined;
      }

      const updateData: Partial<NewMenuItem> = {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.categoryId !== undefined && { categoryId: dto.categoryId }),
        ...(dto.isAvailable !== undefined && { isAvailable: dto.isAvailable }),
        ...(dto.price !== undefined && { price: dto.price.toString() }),
        ...(imageUrl !== undefined && { imageUrl }),
        updatedAt: new Date(),
      };

      const [updated] = await this.db
        .update(menuItemsTable)
        .set(updateData)
        .where(eq(menuItemsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update menu item');
      }

      // Clean up the replaced image only after the update succeeded
      if (previousImageUrl) {
        const publicId = this.extractPublicId(previousImageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId).catch((err) => {
            this.logger.warn(
              `Failed to delete old image ${publicId}: ${err?.message}`,
            );
          });
        }
      }

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Menu item updated',
            body: `"${updated.name}" has been updated.`,
            data: {
              menuItemId: updated.id,
              restaurantId: updated.restaurantId,
              itemName: updated.name,
              categoryId: updated.categoryId,
            },
          })
          .catch((err) =>
            this.logger.warn(
              `Failed to create notification for menu update: ${err?.message}`,
            ),
          );
      }

      await this.invalidateMenu(updated.restaurantId, updated.categoryId, id);
      // Also invalidate old category if changed
      if (existing.categoryId !== updated.categoryId) {
        await this.invalidateMenu(existing.restaurantId, existing.categoryId);
      }
      this.logger.log(`Menu item updated: ${updated.name} (ID: ${id})`);
      return new MenuItemResponseDto(updated);
    }, 'update');
  }

  // ─── TOGGLE AVAILABILITY ───
  async toggleAvailability(
    id: string,
    ownerUserId?: string,
  ): Promise<{ isAvailable: boolean }> {
    return this.handleDbOperation(async () => {
      const item = await this.getRawItem(id);
      await this.assertOwnershipByUser(item.restaurantId, ownerUserId);

      const [updated] = await this.db
        .update(menuItemsTable)
        .set({
          isAvailable: !item.isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(menuItemsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to toggle availability');
      }

      await this.invalidateMenu(updated.restaurantId, updated.categoryId, id);
      this.logger.log(`Menu item ${id} availability: ${updated.isAvailable}`);
      return { isAvailable: updated.isAvailable };
    }, 'toggleAvailability');
  }

  // ─── DELETE ───
  async delete(id: string, ownerUserId?: string): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const item = await this.getRawItem(id);
      await this.assertOwnershipByUser(item.restaurantId, ownerUserId);

      await this.db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));

      // Clean up the remote image only after the delete succeeded
      if (item.imageUrl) {
        const publicId = this.extractPublicId(item.imageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId).catch((err) => {
            this.logger.warn(
              `Failed to delete image ${publicId}: ${err?.message}`,
            );
          });
        }
      }

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Menu item deleted',
            body: `"${item.name}" has been removed from your menu.`,
            data: {
              menuItemId: item.id,
              restaurantId: item.restaurantId,
              itemName: item.name,
            },
          })
          .catch((err) =>
            this.logger.warn(
              `Failed to create notification for menu delete: ${err?.message}`,
            ),
          );
      }

      await this.invalidateMenu(item.restaurantId, item.categoryId, id);
      this.logger.log(`Menu item deleted: ${item.name} (ID: ${id})`);
      return { message: 'Menu item deleted successfully' };
    }, 'delete');
  }

  // ─── BULK CREATE ───
  async bulkCreate(
    restaurantId: string,
    items: CreateMenuItemDto[],
  ): Promise<MenuItemResponseDto[]> {
    return this.handleDbOperation(async () => {
      for (const dto of items) {
        await this.assertCategoryInRestaurant(dto.categoryId, restaurantId);
      }

      const createdItems = await this.db.transaction(async (tx) => {
        const rows: MenuItem[] = [];

        for (const dto of items) {
          const [item] = await tx
            .insert(menuItemsTable)
            .values({
              restaurantId,
              categoryId: dto.categoryId,
              name: dto.name,
              description: dto.description,
              price: dto.price.toString(),
              imageUrl: dto.imageUrl,
              isAvailable: dto.isAvailable ?? true,
            })
            .returning();

          if (item) {
            rows.push(item);
          }
        }

        return rows;
      });

      await this.cache.delByPattern(`menu:restaurant:${restaurantId}:*`);
      await this.cache.del(this.keyGrouped(restaurantId));
      // Categories affected
      const catIds = [...new Set(items.map((i) => i.categoryId))];
      for (const cid of catIds)
        await this.cache.delByPattern(`menu:category:${cid}:*`);

      this.logger.log(
        `Bulk created ${createdItems.length} menu items for restaurant ${restaurantId}`,
      );
      return createdItems.map((item) => new MenuItemResponseDto(item));
    }, 'bulkCreate');
  }

  // ─── BULK DELETE ───
  async bulkDelete(
    ids: string[],
    ownerUserId?: string,
  ): Promise<{ message: string; deleted: number }> {
    return this.handleDbOperation(async () => {
      let deletedCount = 0;
      const orphanImages: string[] = [];

      for (const id of ids) {
        const item = await this.getRawItem(id);
        await this.assertOwnershipByUser(item.restaurantId, ownerUserId);

        await this.db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
        deletedCount++;

        if (item.imageUrl) {
          const publicId = this.extractPublicId(item.imageUrl);
          if (publicId) {
            orphanImages.push(publicId);
          }
        }
      }

      // Best-effort cleanup of remote images after successful deletes
      for (const publicId of orphanImages) {
        await this.cloudinaryService.deleteImage(publicId).catch((err) => {
          this.logger.warn(
            `Failed to delete image ${publicId}: ${err?.message}`,
          );
        });
      }

      // Invalidate affected restaurant/categ caches
      const affected = new Set<string>();
      // Re-use orphanImages already collected — need restaurant scope; safest to blow by pattern for each deleted item's restaurant
      // For simplicity, delete all menu list patterns (cheap, still correct)
      await this.cache.delByPattern('menu:restaurant:*');
      await this.cache.delByPattern('menu:category:*');
      await this.cache.delByPattern('menu:grouped:*');
      // Also del individual item keys (already gone, but clear)
      for (const id of ids) await this.cache.del(this.keyItem(id));
      void affected;

      this.logger.log(`Bulk deleted ${deletedCount} menu items`);
      return {
        message: `${deletedCount} menu items deleted successfully`,
        deleted: deletedCount,
      };
    }, 'bulkDelete');
  }

  // ─── GET FEATURED (public – only from approved restaurants) ───
  async getFeatured(limit = 12): Promise<MenuItemResponseDto[]> {
    const cacheKey = `menu:featured:${limit}`;
    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.LIST_TTL, async () => {
        // Join with restaurants to ensure only verified & active
        const items = await this.db
          .select({
            menuItem: menuItemsTable,
          })
          .from(menuItemsTable)
          .innerJoin(
            restaurantsTable,
            eq(menuItemsTable.restaurantId, restaurantsTable.id),
          )
          .where(
            and(
              eq(menuItemsTable.isAvailable, true),
              eq(restaurantsTable.isVerified, true),
              eq(restaurantsTable.isActive, true),
              isNull(restaurantsTable.deletedAt),
            ),
          )
          .orderBy(desc(menuItemsTable.createdAt))
          .limit(limit);

        return items.map((row) => new MenuItemResponseDto(row.menuItem));
      });
    }, 'getFeatured');
  }

  // ─── GET GROUPED BY CATEGORY ─── (cached)
  async getGroupedByCategory(
    restaurantId: string,
  ): Promise<{ categoryId: string; items: MenuItemResponseDto[] }[]> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(
        this.keyGrouped(restaurantId),
        this.GROUPED_TTL,
        async () => {
          const items = await this.db
            .select()
            .from(menuItemsTable)
            .where(
              and(
                eq(menuItemsTable.restaurantId, restaurantId),
                eq(menuItemsTable.isAvailable, true),
              ),
            )
            .orderBy(desc(menuItemsTable.createdAt));

          const grouped = items.reduce<Record<string, MenuItemResponseDto[]>>(
            (acc, item) => {
              const categoryId = item.categoryId;
              if (!acc[categoryId]) {
                acc[categoryId] = [];
              }
              acc[categoryId].push(new MenuItemResponseDto(item));
              return acc;
            },
            {},
          );

          return Object.entries(grouped).map(([categoryId, groupedItems]) => ({
            categoryId,
            items: groupedItems,
          }));
        },
      );
    }, 'getGroupedByCategory');
  }
}
