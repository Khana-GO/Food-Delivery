import { Injectable, Logger, Inject } from '@nestjs/common';
import {
  eq,
  and,
  desc,
  asc,
  sql,
  isNull,
  isNotNull,
  inArray,
  notInArray,
  gte,
  ne,
  count,
} from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { ordersTable } from '../db/schema/order.schema';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';
import { RestaurantResponseDto } from '../restaurant/dto/restarurant-response.dto';
import { distanceKm } from '../common/search/search.utils';

/** A dynamic Explore row. Only sections with real data are ever returned. */
export interface ExploreSection {
  key: string;
  title: string;
  subtitle?: string;
  restaurants: (RestaurantResponseDto & { distanceKm?: number })[];
}

/** A section is only surfaced when it has at least this many real entries. */
const MIN_SECTION_SIZE = 3;

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);
  private readonly CACHE_TTL = 1800; // 30 minutes
  private readonly CACHE_LIST_TTL = 120; // 2 minutes (newest-first rows change)

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
      .select({
        id: schema.menuCategoriesTable.id,
        name: schema.menuCategoriesTable.name,
        restaurantId: schema.menuCategoriesTable.restaurantId,
      })
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

  /** Clamp a caller-supplied limit so no query or cache key can blow up. */
  private static clampLimit(limit: number, max = 50): number {
    if (!Number.isFinite(limit) || limit <= 0) return 10;
    return Math.min(Math.floor(limit), max);
  }

  // ─── PERSONALIZED RECOMMENDATIONS ───
  async getPersonalizedRecommendations(
    userId: string,
    limit = 10,
  ): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
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
    limit = RecommendationsService.clampLimit(limit);
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
    limit = RecommendationsService.clampLimit(limit);
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

  // ────────────────────────────────────────────────────────────────────────
  // EXPLORE SECTIONS
  // Every section below is derived from real catalogue/order data. Sections
  // with fewer than MIN_SECTION_SIZE real entries are dropped entirely (e.g.
  // "Trending" stays hidden until real orders exist) so Explore never shows an
  // empty or fabricated row.
  // ────────────────────────────────────────────────────────────────────────

  /** Shared public-catalogue filter: active + verified + not deleted. */
  private publicRestaurantWhere() {
    return and(
      isNull(restaurantsTable.deletedAt),
      eq(restaurantsTable.isActive, true),
      eq(restaurantsTable.isVerified, true),
    );
  }

  /** Attaches real distance (km) when a caller location is known. */
  private withDistance<T extends RestaurantResponseDto>(
    restaurants: T[],
    origin?: { lat: number; lng: number } | null,
  ): (T & { distanceKm?: number })[] {
    if (!origin) return restaurants;
    return restaurants.map((r) => {
      const km = distanceKm(origin.lat, origin.lng, r.latitude, r.longitude);
      return km === null ? r : { ...r, distanceKm: km };
    });
  }

  private async selectPublicRestaurants(params: {
    limit: number;
    orderBy?: any[];
    extraWhere?: any[];
  }): Promise<RestaurantResponseDto[]> {
    const rows = await this.db
      .select()
      .from(restaurantsTable)
      .where(and(this.publicRestaurantWhere(), ...(params.extraWhere ?? [])))
      .orderBy(...(params.orderBy ?? [desc(restaurantsTable.averageRating)]))
      .limit(params.limit);
    return rows as unknown as RestaurantResponseDto[];
  }

  /**
   * Trending: restaurants with the most non-cancelled orders in the last 30 days.
   * Returns [] when the platform has no recent order activity — no fabrication.
   */
  async getTrendingRestaurants(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:trending:${limit}`,
      this.CACHE_TTL,
      async () => {
        try {
          const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          const ranked = await this.db
            .select({
              restaurantId: schema.ordersTable.restaurantId,
              total: count(),
            })
            .from(schema.ordersTable)
            .where(
              and(
                gte(schema.ordersTable.createdAt, since),
                ne(schema.ordersTable.orderStatus, 'CANCELLED'),
              ),
            )
            .groupBy(schema.ordersTable.restaurantId)
            .orderBy(desc(count()))
            .limit(limit);

          if (ranked.length < MIN_SECTION_SIZE) return [];

          const ids = ranked.map((r) => r.restaurantId);
          const rows = await this.db
            .select()
            .from(restaurantsTable)
            .where(
              and(
                this.publicRestaurantWhere(),
                inArray(restaurantsTable.id, ids),
              ),
            );

          const orderIndex = new Map(ids.map((id, idx) => [id, idx]));
          const sorted = (rows as unknown as RestaurantResponseDto[]).sort(
            (a, b) => (orderIndex.get(a.id) ?? 0) - (orderIndex.get(b.id) ?? 0),
          );
          return await this.withCategories(sorted);
        } catch (error) {
          this.logger.warn(
            `Trending restaurants unavailable: ${(error as Error).message}`,
          );
          return [];
        }
      },
    );
  }

  /** Top rated: highest rating, tie-broken by review volume. */
  async getTopRated(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:top-rated:${limit}`,
      this.CACHE_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({
          limit,
          orderBy: [
            desc(restaurantsTable.averageRating),
            desc(restaurantsTable.totalReviews),
          ],
        });
        return this.withCategories(rows);
      },
    );
  }

  /** Recently added: newest verified kitchens on the platform. */
  async getRecentlyAdded(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:recent:${limit}`,
      this.CACHE_LIST_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({
          limit,
          orderBy: [desc(restaurantsTable.createdAt)],
        });
        return this.withCategories(rows);
      },
    );
  }

  /** Budget friendly: lowest combined delivery fee + minimum order. */
  async getBudgetFriendly(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:budget:${limit}`,
      this.CACHE_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({
          limit,
          orderBy: [
            asc(restaurantsTable.deliveryFee),
            asc(restaurantsTable.minimumOrderAmount),
            desc(restaurantsTable.averageRating),
          ],
        });
        return this.withCategories(rows);
      },
    );
  }

  /** Fast delivery: shortest quoted ETA. */
  async getFastDelivery(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:fast:${limit}`,
      this.CACHE_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({
          limit,
          orderBy: [
            asc(restaurantsTable.estimatedDeliveryTime),
            desc(restaurantsTable.averageRating),
          ],
          extraWhere: [isNotNull(restaurantsTable.estimatedDeliveryTime)],
        });
        return this.withCategories(rows);
      },
    );
  }

  /** Cafes & bakeries discovered from cuisine data, not from the venue name. */
  async getCafes(limit = 8): Promise<RestaurantResponseDto[]> {
    limit = RecommendationsService.clampLimit(limit);
    return this.cache.wrap(
      `explore:cafes:${limit}`,
      this.CACHE_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({
          limit,
          orderBy: [desc(restaurantsTable.averageRating)],
          extraWhere: [
            sql`(${restaurantsTable.cuisineType} ILIKE '%cafe%'
            OR ${restaurantsTable.cuisineType} ILIKE '%coffee%'
            OR ${restaurantsTable.cuisineType} ILIKE '%bakery%'
            OR ${restaurantsTable.cuisineType} ILIKE '%tea%'
            OR ${restaurantsTable.cuisineType} ILIKE '%dessert%'
            OR ${restaurantsTable.cuisineType} ILIKE '%patisserie%')`,
          ],
        });
        return this.withCategories(rows);
      },
    );
  }

  /**
   * Popular near you: strictly distance-based around a real caller location.
   * Returns [] without a location rather than pretending everything is nearby.
   */
  async getPopularNearYou(
    origin: { lat: number; lng: number } | undefined,
    limit = 8,
  ): Promise<RestaurantResponseDto[]> {
    if (!origin) return [];
    limit = RecommendationsService.clampLimit(limit);
    const rounded = {
      lat: Math.round(origin.lat * 1000) / 1000,
      lng: Math.round(origin.lng * 1000) / 1000,
    };
    return this.cache.wrap(
      `explore:near:${rounded.lat}:${rounded.lng}:${limit}`,
      this.CACHE_TTL,
      async () => {
        const rows = await this.selectPublicRestaurants({ limit: 50 });
        const withKm = this.withDistance(rows, rounded)
          .filter((r) => r.distanceKm !== undefined)
          .sort((a, b) => (a.distanceKm ?? 0) - (b.distanceKm ?? 0))
          .slice(0, limit) as RestaurantResponseDto[];
        return this.withCategories(withKm);
      },
    );
  }

  /**
   * Assembles the Explore feed from available data only. Order reflects the
   * value to the customer: what is near, what is hot, what is good, what is new.
   */
  async getExploreSections(
    origin?: { lat: number; lng: number } | null,
    limit = 8,
  ): Promise<ExploreSection[]> {
    const [
      nearYou,
      trending,
      topRated,
      fastDelivery,
      cafes,
      budget,
      recentlyAdded,
    ] = await Promise.all([
      this.getPopularNearYou(origin ?? undefined, limit),
      this.getTrendingRestaurants(limit),
      this.getTopRated(limit),
      this.getFastDelivery(limit),
      this.getCafes(limit),
      this.getBudgetFriendly(limit),
      this.getRecentlyAdded(limit),
    ]);

    const candidates: ExploreSection[] = [
      {
        key: 'near_you',
        title: 'Popular near you',
        subtitle: 'Closest kitchens to your delivery address',
        restaurants: this.withDistance(nearYou, origin),
      },
      {
        key: 'trending',
        title: 'Trending in Butwal',
        subtitle: 'Most ordered in the last 30 days',
        restaurants: trending,
      },
      {
        key: 'top_rated',
        title: 'Top rated',
        subtitle: 'Highest customer ratings',
        restaurants: topRated,
      },
      {
        key: 'fast_delivery',
        title: 'Fast delivery',
        subtitle: 'Quickest kitchens right now',
        restaurants: fastDelivery,
      },
      {
        key: 'cafes',
        title: 'Cafes & bakeries',
        subtitle: 'Coffee, tea and sweet treats',
        restaurants: cafes,
      },
      {
        key: 'budget',
        title: 'Budget friendly',
        subtitle: 'Lowest delivery fees',
        restaurants: budget,
      },
      {
        key: 'recently_added',
        title: 'Recently added',
        subtitle: 'New kitchens on KhanaGo',
        restaurants: recentlyAdded,
      },
    ];

    // Only expose sections backed by enough real data.
    return candidates.filter((s) => s.restaurants.length >= MIN_SECTION_SIZE);
  }
}
