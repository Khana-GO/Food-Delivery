import { Injectable, Logger, Inject } from '@nestjs/common';
import { eq, and, desc, sql, isNull, inArray, notInArray } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { ordersTable } from '../db/schema/order.schema';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';
import { RestaurantResponseDto } from '../restaurant/dto/restarurant-response.dto';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  private keyRecommendations(userId: string) {
    return `recommendations:user:${userId}`;
  }

  private keyPopular(limit: number) {
    return `restaurants:popular:${limit}`;
  }

  // ─── ATTACH MENU CATEGORIES ───
  // Enriches restaurant DTOs with the list of menu categories they serve so
  // the UI can show all categories per restaurant (not just cuisineType).
  private async withCategories<T extends RestaurantResponseDto>(
    restaurants: T[],
  ): Promise<T[]> {
    if (restaurants.length === 0) return restaurants;
    const ids = restaurants.map((r) => r.id);
    const rows = await this.db
      .select({ id: schema.menuCategoriesTable.id, name: schema.menuCategoriesTable.name, restaurantId: schema.menuCategoriesTable.restaurantId })
      .from(schema.menuCategoriesTable)
      .where(inArray(schema.menuCategoriesTable.restaurantId, ids));

    const byRestaurant = new Map<string, { id: string; name: string }[]>();
    for (const row of rows) {
      const list = byRestaurant.get(row.restaurantId) || [];
      list.push({ id: row.id, name: row.name });
      byRestaurant.set(row.restaurantId, list);
    }

    return restaurants.map((r) => ({
      ...r,
      categories: byRestaurant.get(r.id) || [],
    }));
  }

  // ─── PERSONALIZED RECOMMENDATIONS ───
  async getPersonalizedRecommendations(
    userId: string,
    limit = 10,
  ): Promise<RestaurantResponseDto[]> {
    try {
      const cacheKey = this.keyRecommendations(userId);
      const cached = await this.cache.get<RestaurantResponseDto[]>(cacheKey);
      if (cached) return cached;

      // 1. Get user's order history
      const userOrders = await this.db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.customerId, userId))
        .orderBy(desc(ordersTable.createdAt))
        .limit(20);

      // 2. Get favorite restaurants
      const userFavorites = await this.db
        .select()
        .from(schema.favoriteRestaurantsTable)
        .where(eq(schema.favoriteRestaurantsTable.userId, userId));

      const favoriteRestaurantIds = userFavorites.map((f) => f.restaurantId);
      const orderedRestaurantIds = userOrders.map((o) => o.restaurantId);
      const allUserRestaurantIds = [
        ...new Set([...orderedRestaurantIds, ...favoriteRestaurantIds]),
      ];

      let recommendedRestaurants: RestaurantResponseDto[] = [];

      if (allUserRestaurantIds.length > 0) {
        // 4. Find similar restaurants (based on cuisine type)
        const userRestaurants = await this.db
          .select()
          .from(restaurantsTable)
          .where(inArray(restaurantsTable.id, allUserRestaurantIds));

        const cuisineTypes = [
          ...new Set(userRestaurants.map((r) => r.cuisineType).filter(Boolean)),
        ];

        if (cuisineTypes.length > 0) {
          const similarRestaurants = await this.db
            .select()
            .from(restaurantsTable)
            .where(
              and(
                inArray(restaurantsTable.cuisineType, cuisineTypes),
                notInArray(restaurantsTable.id, allUserRestaurantIds),
                isNull(restaurantsTable.deletedAt),
                eq(restaurantsTable.isActive, true),
                eq(restaurantsTable.isVerified, true),
              ),
            )
            .limit(limit * 2);

          // 5. Score restaurants
          const scoredRestaurants = similarRestaurants.map((restaurant) => {
            let score = 0;
            const rating = Number(restaurant.averageRating) || 0;
            score += rating * 2;
            if (restaurant.isOpen) score += 3;
            if (restaurant.isVerified) score += 2;
            // cuisine match already filtered, but keep bonus
            const cuisineMatch = userRestaurants.some(
              (r) => r.cuisineType === restaurant.cuisineType,
            );
            if (cuisineMatch) score += 5;
            return { ...restaurant, score };
          });

          scoredRestaurants.sort((a, b) => b.score - a.score);

          recommendedRestaurants = scoredRestaurants.slice(0, limit).map(
            (r) =>
              ({
                id: r.id,
                name: r.name,
                slug: r.slug,
                description: r.description,
                logoUrl: r.logoUrl,
                coverImageUrl: r.coverImageUrl,
                cuisineType: r.cuisineType,
                averageRating: r.averageRating,
                totalReviews: r.totalReviews,
                isOpen: r.isOpen,
                isVerified: r.isVerified,
                deliveryFee: r.deliveryFee,
                estimatedDeliveryTime: r.estimatedDeliveryTime,
                address: r.address,
                latitude: r.latitude,
                longitude: r.longitude,
              }) as unknown as RestaurantResponseDto,
          );
        }
      }

      // 6. If not enough recommendations, add popular restaurants
      if (recommendedRestaurants.length < limit) {
        const remaining = limit - recommendedRestaurants.length;
        const excludeIds = [
          ...allUserRestaurantIds,
          ...recommendedRestaurants.map((r) => r.id),
        ];

        const whereClauses = [
          isNull(restaurantsTable.deletedAt),
          eq(restaurantsTable.isActive, true),
          eq(restaurantsTable.isVerified, true),
          ...(excludeIds.length > 0
            ? [notInArray(restaurantsTable.id, excludeIds)]
            : []),
        ];

        const popularRows = await this.db
          .select()
          .from(restaurantsTable)
          .where(and(...whereClauses))
          .orderBy(
            desc(restaurantsTable.averageRating),
            desc(restaurantsTable.totalReviews),
          )
          .limit(remaining);

        const popularToAdd = popularRows.map(
          (r) =>
            ({
              id: r.id,
              name: r.name,
              slug: r.slug,
              description: r.description,
              logoUrl: r.logoUrl,
              coverImageUrl: r.coverImageUrl,
              cuisineType: r.cuisineType,
              averageRating: r.averageRating,
              totalReviews: r.totalReviews,
              isOpen: r.isOpen,
              isVerified: r.isVerified,
              deliveryFee: r.deliveryFee,
              estimatedDeliveryTime: r.estimatedDeliveryTime,
              address: r.address,
              latitude: r.latitude,
              longitude: r.longitude,
            }) as unknown as RestaurantResponseDto,
        );

        recommendedRestaurants = [...recommendedRestaurants, ...popularToAdd];
      }

      const finalResult = recommendedRestaurants.slice(0, limit);
      const enriched = await this.withCategories(finalResult);
      await this.cache.set(cacheKey, enriched, this.CACHE_TTL);
      return enriched;
    } catch (error) {
      this.logger.error(
        `Failed to get recommendations: ${(error as Error).message}`,
      );
      return this.getPopularRestaurants(limit);
    }
  }

  // ─── POPULAR RESTAURANTS ───
  async getPopularRestaurants(limit = 10): Promise<RestaurantResponseDto[]> {
    try {
      const cacheKey = this.keyPopular(limit);
      const cached = await this.cache.get<RestaurantResponseDto[]>(cacheKey);
      if (cached) return cached;

      const restaurants = await this.db
        .select()
        .from(restaurantsTable)
        .where(
          and(
            isNull(restaurantsTable.deletedAt),
            eq(restaurantsTable.isActive, true),
            eq(restaurantsTable.isVerified, true),
          ),
        )
        .orderBy(
          desc(restaurantsTable.averageRating),
          desc(restaurantsTable.totalReviews),
        )
        .limit(limit);

      const result = restaurants as unknown as RestaurantResponseDto[];
      const enriched = await this.withCategories(result);
      await this.cache.set(cacheKey, enriched, this.CACHE_TTL);
      return enriched;
    } catch (error) {
      this.logger.error(
        `Failed to get popular restaurants: ${(error as Error).message}`,
      );
      throw error;
    }
  }

  // ─── RECENTLY ORDERED ───
  async getRecentlyOrdered(
    userId: string,
    limit = 5,
  ): Promise<RestaurantResponseDto[]> {
    try {
      const recentOrders = await this.db
        .select()
        .from(ordersTable)
        .where(eq(ordersTable.customerId, userId))
        .orderBy(desc(ordersTable.createdAt))
        .limit(limit);

      if (recentOrders.length === 0) return [];

      const restaurantIds = [
        ...new Set(recentOrders.map((o) => o.restaurantId)),
      ];
      if (restaurantIds.length === 0) return [];

      const restaurants = await this.db
        .select()
        .from(restaurantsTable)
        .where(
          and(
            inArray(restaurantsTable.id, restaurantIds),
            isNull(restaurantsTable.deletedAt),
            eq(restaurantsTable.isActive, true),
            eq(restaurantsTable.isVerified, true),
          ),
        );

      // Preserve ordering by most recent (distinct)
      const orderMap = new Map(restaurantIds.map((id, idx) => [id, idx]));
      restaurants.sort((a, b) => orderMap.get(a.id)! - orderMap.get(b.id)!);

      const mapped = restaurants.map(
        (r) =>
          ({
            id: r.id,
            name: r.name,
            slug: r.slug,
            description: r.description,
            logoUrl: r.logoUrl,
            coverImageUrl: r.coverImageUrl,
            cuisineType: r.cuisineType,
            averageRating: r.averageRating,
            totalReviews: r.totalReviews,
            isOpen: r.isOpen,
            isVerified: r.isVerified,
            deliveryFee: r.deliveryFee,
            estimatedDeliveryTime: r.estimatedDeliveryTime,
            address: r.address,
            latitude: r.latitude,
            longitude: r.longitude,
          }) as unknown as RestaurantResponseDto,
      );

      return this.withCategories(mapped);
    } catch (error) {
      this.logger.error(
        `Failed to get recently ordered: ${(error as Error).message}`,
      );
      return [];
    }
  }
}
