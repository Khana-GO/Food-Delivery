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

@Injectable()
export class CategoriesService {
  private readonly logger = new Logger(CategoriesService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
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
   * Ensures the category belongs to the requesting owner's restaurant.
   * Admins bypass this check by passing no `ownerRestaurantId`.
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

      this.logger.log(
        `Category created: ${category.name} (ID: ${category.id})`,
      );
      return new CategoryResponseDto(category);
    }, 'create');
  }

  // ─── FIND ALL (By Restaurant) ───
  async findByRestaurant(
    restaurantId: string,
    includeItemCount: boolean = false,
  ): Promise<CategoryResponseDto[]> {
    return this.handleDbOperation(async () => {
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
    }, 'findByRestaurant');
  }

  // ─── FIND BY ID ───
  async findById(id: string): Promise<CategoryResponseDto> {
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

  // ─── UPDATE ───
  async update(
    id: string,
    dto: UpdateCategoryDto,
    ownerRestaurantId?: string,
  ): Promise<CategoryResponseDto> {
    return this.handleDbOperation(async () => {
      const existing = await this.findById(id);
      this.assertOwnership(existing.restaurantId, ownerRestaurantId);

      // Check if new name conflicts with another category in the same restaurant
      if (dto.name && dto.name !== existing.name) {
        const conflict = await this.db.query.menuCategoriesTable.findFirst({
          where: and(
            eq(schema.menuCategoriesTable.name, dto.name),
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
          ...(dto.name ? { name: dto.name } : {}),
          updatedAt: new Date(),
        })
        .where(eq(schema.menuCategoriesTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update category');
      }

      this.logger.log(`Category updated: ${updated.name} (ID: ${id})`);
      return new CategoryResponseDto(updated);
    }, 'update');
  }

  // ─── DELETE ───
  async delete(
    id: string,
    ownerRestaurantId?: string,
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const category = await this.findById(id);
      this.assertOwnership(category.restaurantId, ownerRestaurantId);

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

      this.logger.log(`Category deleted: ${category.name} (ID: ${id})`);
      return { message: 'Category deleted successfully' };
    }, 'delete');
  }
}
