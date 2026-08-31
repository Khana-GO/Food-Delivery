import { Injectable, Logger, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RecommendationsService } from '../recommendation/recommendation.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CategoryResponseDto } from '../menu-categories/dto/category-response.dto';
import { DATABASE } from '../db/database.constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { desc, eq, and, isNull, sql } from 'drizzle-orm';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly recommendationsService: RecommendationsService,
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    const cacheKey = `dashboard:user:${userId}`;
    return this.cache.wrap(cacheKey, 30, async () => {
      try {
        const user = await this.usersService.findByIdOrThrow(userId);
        const userData = new UserResponseDto(user);

        const [
          categories,
          popularRestaurants,
          recommendations,
          recentlyOrdered,
          featuredMenuItems,
        ] = await Promise.all([
          this.getCategoriesForUser(),
          this.recommendationsService.getPopularRestaurants(6),
          this.recommendationsService.getPersonalizedRecommendations(userId, 6),
          this.recommendationsService.getRecentlyOrdered(userId, 4),
          this.getFeaturedMenuItems(16),
        ]);

        return {
          user: userData,
          popularRestaurants,
          recommendations,
          recentlyOrdered,
          categories,
          featuredMenuItems,
        };
      } catch (error) {
        this.logger.error(`Failed to get dashboard: ${(error as Error).message}`);
        throw error;
      }
    });
  }

  private async getCategoriesForUser(): Promise<CategoryResponseDto[]> {
    return this.cache.wrap('dashboard:categories:approved', 60, async () => {
      try {
        const approvedRestaurantIds = await this.db
          .select({ id: schema.restaurantsTable.id })
          .from(schema.restaurantsTable)
          .where(
            and(
              eq(schema.restaurantsTable.isVerified, true),
              eq(schema.restaurantsTable.isActive, true),
              isNull(schema.restaurantsTable.deletedAt),
            ),
          );

      const ids = approvedRestaurantIds.map((r) => r.id);
      if (ids.length === 0) return [];

      // Fetch categories belonging to approved restaurants, newest first
      const rows = await this.db.query.menuCategoriesTable.findMany({
        where: (cat, { inArray }) => inArray(cat.restaurantId, ids),
        orderBy: [desc(schema.menuCategoriesTable.createdAt)],
        limit: 24,
      });

      if (rows.length === 0) return [];

      // Deduplicate by name (different approved restaurants may share name)
      const seen = new Set<string>();
      const deduped: typeof rows = [];
      for (const r of rows) {
        const key = r.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(r);
        }
        if (deduped.length >= 8) break;
      }

        return deduped.map((cat) => new CategoryResponseDto(cat as any));
      } catch (error) {
        this.logger.warn(`Failed to get categories: ${(error as Error).message}`);
        return [];
      }
    });
  }

  private async getFeaturedMenuItems(limit = 8): Promise<any[]> {
    return this.cache.wrap(`dashboard:featured:${limit}`, 60, async () => {
      try {
        const items = await this.db
          .select({
          menuItem: schema.menuItemsTable,
          restaurantName: schema.restaurantsTable.name,
        })
        .from(schema.menuItemsTable)
        .innerJoin(
          schema.restaurantsTable,
          eq(schema.menuItemsTable.restaurantId, schema.restaurantsTable.id),
        )
        .where(
          and(
            eq(schema.menuItemsTable.isAvailable, true),
            eq(schema.restaurantsTable.isVerified, true),
            eq(schema.restaurantsTable.isActive, true),
            isNull(schema.restaurantsTable.deletedAt),
          ),
        )
        .orderBy(desc(schema.menuItemsTable.createdAt))
        .limit(limit);

      // Map to expected shape (MenuItem plus restaurantName for UI)
      return items.map((row) => ({
        id: row.menuItem.id,
        restaurantId: row.menuItem.restaurantId,
          categoryId: row.menuItem.categoryId,
          name: row.menuItem.name,
          description: row.menuItem.description,
          price: Number(row.menuItem.price),
          imageUrl: row.menuItem.imageUrl,
          isAvailable: row.menuItem.isAvailable,
          createdAt: row.menuItem.createdAt,
          updatedAt: row.menuItem.updatedAt,
          restaurantName: row.restaurantName,
        }));
      } catch (error) {
        this.logger.warn(`Failed to get featured menus: ${(error as Error).message}`);
        return [];
      }
    });
  }
}
