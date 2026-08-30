import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, inArray, desc, asc, count, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { CategoryResponseDto } from './dto/category-response.dto';
import * as schema from '../db/schema';
import { CreateCategoryDto } from './dto/create-menu-category.dto';
import { UpdateCategoryDto } from './dto/update-menu-category.dto';
import { NotificationsService } from '../notification/notification.service';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);
  private readonly LIST_TTL = 60;
  private readonly OWNER_TTL = 60;
  private readonly ENTITY_TTL = 300;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly notificationsService: NotificationsService,
    private readonly cache: CacheService,
  ) {}

  // ─── CACHE KEYS ───
  private keyByRestaurant(restaurantId: string, includeItemCount: boolean) {
    return `category:restaurant:${restaurantId}:count:${includeItemCount}`;
  }
  private keyByOwner(ownerId: string, includeItemCount: boolean) {
    return `category:owner:${ownerId}:count:${includeItemCount}`;
  }
  private keyId(id: string) {
    return `category:id:${id}`;
  }
  private async invalidateCategory(restaurantId: string, ownerId?: string, categoryId?: string) {
    const ops: Promise<void>[] = [
      this.cache.del(this.keyByRestaurant(restaurantId, true)),
      this.cache.del(this.keyByRestaurant(restaurantId, false)),
      this.cache.delByPattern(`category:restaurant:${restaurantId}:*`),
    ];
    if (ownerId) {
      ops.push(
        this.cache.del(this.keyByOwner(ownerId, true)),
        this.cache.del(this.keyByOwner(ownerId, false)),
        this.cache.delByPattern(`category:owner:${ownerId}:*`),
      );
    }
    if (categoryId) ops.push(this.cache.del(this.keyId(categoryId)));
    // Menu caches depend on categories — blow them too (cross-service invalidation via pattern)
    ops.push(this.cache.delByPattern(`menu:restaurant:${restaurantId}:*`));
    ops.push(this.cache.delByPattern(`menu:category:*`));
    await Promise.all(ops);
  }

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      // Expected client errors — downgrade to WARN to avoid log flooding on 404 retries
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        this.logger.warn(`[${context}] ${error.message}`);
        throw error;
      }
      this.logger.error(`[${context}] Error:`, error);
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  // ─── Helper ───
  /**
   * Resolves the restaurant managed by the given owner.
   * Deterministic: oldest active restaurant first, soft-deleted excluded —
   * the same restaurant every caller gets for a given user.
   */
  async getRestaurantIdByUserId(userId: string): Promise<string> {
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: and(
        eq(schema.restaurantsTable.ownerId, userId),
        isNull(schema.restaurantsTable.deletedAt),
      ),
      orderBy: [asc(schema.restaurantsTable.createdAt)],
    });

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
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: and(
        eq(schema.restaurantsTable.id, restaurantId),
        eq(schema.restaurantsTable.ownerId, userId),
        isNull(schema.restaurantsTable.deletedAt),
      ),
    });

    if (!restaurant) {
      throw new ForbiddenException('You do not own this restaurant');
    }

    return restaurant.id;
  }

  /**
   * Ensures the category belongs to a restaurant owned by the requesting user.
   * Supports owners with multiple restaurants — any owned restaurant is allowed.
   * Admins bypass this check by passing no `ownerUserId`.
   */
  private async assertOwnershipByUser(
    categoryRestaurantId: string,
    ownerUserId?: string,
  ): Promise<void> {
    if (!ownerUserId) return; // admin bypass
    const owned = await this.db.query.restaurantsTable.findFirst({
      where: and(
        eq(schema.restaurantsTable.id, categoryRestaurantId),
        eq(schema.restaurantsTable.ownerId, ownerUserId),
        isNull(schema.restaurantsTable.deletedAt),
      ),
    });
    if (!owned) {
      throw new ForbiddenException(
        'You do not have permission to manage this category',
      );
    }
  }

  /**
   * @deprecated Use assertOwnershipByUser. Kept for internal single-restaurant check.
   */
  private assertOwnership(
    categoryRestaurantId: string,
    ownerRestaurantId?: string,
  ): void {
    if (ownerRestaurantId && categoryRestaurantId !== ownerRestaurantId) {
      throw new ForbiddenException(
        'You do not have permission to manage this category',
      );
    }
  }

  // ─── CREATE ───
  async create(
    restaurantId: string,
    dto: CreateCategoryDto,
    ownerUserId?: string,
  ): Promise<CategoryResponseDto> {
    return this.handleDbOperation(async () => {
      // Check if category with same name exists for this restaurant
      const existing = await this.db.query.menuCategoriesTable.findFirst({
        where: and(
          eq(schema.menuCategoriesTable.name, dto.name),
          eq(schema.menuCategoriesTable.restaurantId, restaurantId),
        ),
      });

      if (existing) {
        throw new ConflictException('Category with this name already exists');
      }

      const [category] = await this.db
        .insert(schema.menuCategoriesTable)
        .values({
          name: dto.name,
          restaurantId,
        })
        .returning();

      if (!category) {
        throw new InternalServerErrorException('Failed to create category');
      }

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Category created',
            body: `Category "${category.name}" has been created.`,
            data: { categoryId: category.id, restaurantId, categoryName: category.name },
          })
          .catch((err) => this.logger.warn(`Failed to create notification for category create: ${err?.message}`));
      }

      await this.invalidateCategory(restaurantId, ownerUserId);
      this.logger.log(
        `Category created: ${category.name} (ID: ${category.id})`,
      );
      return new CategoryResponseDto(category);
    }, 'create');
  }

  // ─── FIND ALL (For Owner — across all owned restaurants) ─── (cached)
  async findAllForOwner(
    ownerId: string,
    includeItemCount: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyByOwner(ownerId, includeItemCount), this.OWNER_TTL, async () => {
        const owned = await this.db
          .select({ id: schema.restaurantsTable.id })
          .from(schema.restaurantsTable)
          .where(
            and(
              eq(schema.restaurantsTable.ownerId, ownerId),
              isNull(schema.restaurantsTable.deletedAt),
            ),
          );
        if (owned.length === 0) return [];
        const restaurantIds = owned.map((r) => r.id);
        const categories = await this.db.query.menuCategoriesTable.findMany({
          where: inArray(schema.menuCategoriesTable.restaurantId, restaurantIds),
          orderBy: [desc(schema.menuCategoriesTable.createdAt)],
        });
        if (categories.length === 0) return [];
        if (!includeItemCount) {
          return categories.map((cat) => new CategoryResponseDto(cat));
        }
        const itemCounts = await this.db
          .select({
            categoryId: schema.menuItemsTable.categoryId,
            total: count(),
          })
          .from(schema.menuItemsTable)
          .where(
            and(
              inArray(
                schema.menuItemsTable.categoryId,
                categories.map((c) => c.id),
              ),
              eq(schema.menuItemsTable.isAvailable, true),
            ),
          )
          .groupBy(schema.menuItemsTable.categoryId);
        const countMap = new Map(itemCounts.map((r) => [r.categoryId, r.total]));
        return categories.map((cat) => {
          const dto = new CategoryResponseDto(cat);
          dto.itemCount = countMap.get(cat.id) ?? 0;
          return dto;
        });
      });
    }, 'findAllForOwner');
  }

  // ─── FIND ALL (By Restaurant) ─── (cached)
  async findByRestaurant(
    restaurantId: string,
    includeItemCount: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyByRestaurant(restaurantId, includeItemCount), this.LIST_TTL, async () => {
        const categories = await this.db.query.menuCategoriesTable.findMany({
          where: eq(schema.menuCategoriesTable.restaurantId, restaurantId),
          orderBy: [desc(schema.menuCategoriesTable.createdAt)],
        });

        if (categories.length === 0) {
          return [];
        }

        if (!includeItemCount) {
          return categories.map((cat) => new CategoryResponseDto(cat));
        }

        // Single grouped query for item counts across all categories
        const itemCounts = await this.db
          .select({
            categoryId: schema.menuItemsTable.categoryId,
            total: count(),
          })
          .from(schema.menuItemsTable)
          .where(
            and(
              inArray(
                schema.menuItemsTable.categoryId,
                categories.map((c) => c.id),
              ),
              eq(schema.menuItemsTable.isAvailable, true),
            ),
          )
          .groupBy(schema.menuItemsTable.categoryId);

        const countMap = new Map(itemCounts.map((r) => [r.categoryId, r.total]));

        return categories.map((cat) => {
          const dto = new CategoryResponseDto(cat);
          dto.itemCount = countMap.get(cat.id) ?? 0;
          return dto;
        });
      });
    }, 'findByRestaurant');
  }

  // ─── FIND BY ID ─── (cached)
  async findById(
    id: string,
    opts: { bypassCache?: boolean } = {},
  ): Promise<CategoryResponseDto> {
    if (opts.bypassCache) {
      return this.handleDbOperation(async () => {
        const category = await this.db.query.menuCategoriesTable.findFirst({
          where: eq(schema.menuCategoriesTable.id, id),
        });
        if (!category) {
          throw new NotFoundException(`Category with ID ${id} not found`);
        }
        return new CategoryResponseDto(category);
      }, 'findById');
    }
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyId(id), this.ENTITY_TTL, async () => {
        const category = await this.db.query.menuCategoriesTable.findFirst({
          where: eq(schema.menuCategoriesTable.id, id),
        });

        if (!category) {
          throw new NotFoundException(`Category with ID ${id} not found`);
        }

        return new CategoryResponseDto(category);
      });
    }, 'findById');
  }

  /** Fresh DB lookup without cache — use inside update/delete to avoid stale cache. */
  private async findByIdFresh(id: string): Promise<CategoryResponseDto> {
    return this.findById(id, { bypassCache: true });
  }

  // ─── UPDATE ───
  async update(
    id: string,
    dto: UpdateCategoryDto,
    ownerUserId?: string,
  ): Promise<CategoryResponseDto> {
    return this.handleDbOperation(async () => {
      // Use fresh DB lookup to avoid stale cache causing 500 on deleted rows
      const existing = await this.findByIdFresh(id);
      await this.assertOwnershipByUser(existing.restaurantId, ownerUserId);

      // Nothing to update — drift: still bump updatedAt? We treat empty dto as no-op.
      if (!dto.name || dto.name.trim() === '') {
        // If client sent no name, just return existing without DB write
        this.logger.warn(`[update] No updatable fields for category ${id}`);
        return existing;
      }

      if (dto.name !== existing.name) {
        const conflict = await this.db.query.menuCategoriesTable.findFirst({
          where: and(
            eq(schema.menuCategoriesTable.name, dto.name.trim()),
            eq(schema.menuCategoriesTable.restaurantId, existing.restaurantId),
          ),
        });

        if (conflict) {
          throw new ConflictException('Category with this name already exists');
        }
      }

      const [updated] = await this.db
        .update(schema.menuCategoriesTable)
        .set({
          name: dto.name.trim(),
          updatedAt: new Date(),
        })
        .where(eq(schema.menuCategoriesTable.id, id))
        .returning();

      if (!updated) {
        // Row disappeared between findById and update (race) — treat as 404, evict stale cache
        await this.cache.del(this.keyId(id));
        throw new NotFoundException(`Category with ID ${id} not found`);
      }

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Category updated',
            body: `Category "${updated.name}" has been updated.`,
            data: { categoryId: updated.id, restaurantId: updated.restaurantId, categoryName: updated.name },
          })
          .catch((err) => this.logger.warn(`Failed to create notification for category update: ${err?.message}`));
      }

      await this.invalidateCategory(updated.restaurantId, ownerUserId, id);
      this.logger.log(`Category updated: ${updated.name} (ID: ${id})`);
      return new CategoryResponseDto(updated);
    }, 'update');
  }

  // ─── DELETE ───
  async delete(
    id: string,
    ownerUserId?: string,
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const category = await this.findByIdFresh(id);
      await this.assertOwnershipByUser(category.restaurantId, ownerUserId);

      // Check if category has menu items
      const [countResult] = await this.db
        .select({ total: count() })
        .from(schema.menuItemsTable)
        .where(eq(schema.menuItemsTable.categoryId, id));

      if (countResult?.total > 0) {
        throw new ConflictException(
          `Cannot delete category "${category.name}" because it contains menu items. Please reassign or delete the items first.`,
        );
      }

      await this.db
        .delete(schema.menuCategoriesTable)
        .where(eq(schema.menuCategoriesTable.id, id));

      if (ownerUserId) {
        await this.notificationsService
          .create({
            userId: ownerUserId,
            type: 'restaurant',
            title: 'Category deleted',
            body: `Category "${category.name}" has been deleted.`,
            data: { categoryId: category.id, restaurantId: category.restaurantId, categoryName: category.name },
          })
          .catch((err) => this.logger.warn(`Failed to create notification for category delete: ${err?.message}`));
      }

      await this.invalidateCategory(category.restaurantId, ownerUserId, id);
      this.logger.log(`Category deleted: ${category.name} (ID: ${id})`);
      return { message: 'Category deleted successfully' };
    }, 'delete');
  }
}
