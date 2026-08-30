import { Injectable, Logger, Inject } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RecommendationsService } from '../recommendation/recommendation.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CategoryResponseDto } from '../menu-categories/dto/category-response.dto';
import { DATABASE } from '../db/database.constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { desc } from 'drizzle-orm';

@Injectable()
export class DashboardService {
  private readonly logger = new Logger(DashboardService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly recommendationsService: RecommendationsService,
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  async getDashboard(userId: string): Promise<DashboardResponseDto> {
    try {
      // 1. Get user profile
      const user = await this.usersService.findByIdOrThrow(userId);
      const userData = new UserResponseDto(user);

      // Parallelize independent fetches
      const [categories, popularRestaurants, recommendations, recentlyOrdered] =
        await Promise.all([
          this.getCategoriesForUser(),
          this.recommendationsService.getPopularRestaurants(6),
          this.recommendationsService.getPersonalizedRecommendations(userId, 6),
          this.recommendationsService.getRecentlyOrdered(userId, 4),
        ]);

      return {
        user: userData,
        popularRestaurants,
        recommendations,
        recentlyOrdered,
        categories,
      };
    } catch (error) {
      this.logger.error(`Failed to get dashboard: ${(error as Error).message}`);
      throw error;
    }
  }

  private async getCategoriesForUser(): Promise<CategoryResponseDto[]> {
    try {
      // Fetch real categories from DB — distinct by name, limited to 12, ordered by newest
      const rows = await this.db.query.menuCategoriesTable.findMany({
        orderBy: [desc(schema.menuCategoriesTable.createdAt)],
        limit: 12,
      });

      if (rows.length === 0) return [];

      // Deduplicate by name (different restaurants may have same category name)
      const seen = new Set<string>();
      const deduped: typeof rows = [];
      for (const r of rows) {
        const key = r.name.toLowerCase().trim();
        if (!seen.has(key)) {
          seen.add(key);
          deduped.push(r);
        }
        if (deduped.length >= 6) break;
      }

      return deduped.map((cat) => new CategoryResponseDto(cat as any));
    } catch (error) {
      this.logger.warn(`Failed to get categories: ${(error as Error).message}`);
      return [];
    }
  }
}
