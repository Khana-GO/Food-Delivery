import { Injectable, Logger, Inject } from '@nestjs/common';
import { and, desc, eq, ilike, isNull, or, sql, count } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import * as schema from '../db/schema';
import { CacheService } from '../redis/cache.service';
import { RestaurantsService } from '../restaurant/restaurant.service';
import { MenuItemsService } from '../menu/menu.service';
import { RestaurantResponseDto } from '../restaurant/dto/restarurant-response.dto';
import { MenuItemSearchResultDto } from '../menu/dto/menu-item-search-result.dto';
import {
  buildSearchPlan,
  didYouMean,
  distanceKm,
  ilikePattern,
  normalizeText,
  tokenize,
} from '../common/search/search.utils';
import { FOOD_VOCABULARY_UNIQUE } from '../common/search/search.vocabulary';

export type SearchSuggestionType =
  'dish' | 'restaurant' | 'category' | 'popular';

export interface SearchSuggestion {
  label: string;
  type: SearchSuggestionType;
  /** Present for dish/restaurant/category hits so the UI can deep-link. */
  id?: string;
  restaurantName?: string;
}

export interface UnifiedSearchResult {
  query: string;
  restaurants: RestaurantResponseDto[];
  dishes: MenuItemSearchResultDto[];
  /** Per-type matched counts (before per-type limits are applied). */
  counts: { restaurants: number; dishes: number };
  didYouMean: string[];
  suggestions: SearchSuggestion[];
}

export interface UnifiedSearchOptions {
  q?: string;
  limit?: number;
  lat?: number;
  lng?: number;
  type?: 'all' | 'restaurants' | 'dishes';
  /** Verified + active only. On by default so results match Explore. */
  publicOnly?: boolean;
}

@Injectable()
export class SearchService {
  private readonly logger = new Logger(SearchService.name);
  private readonly SEARCH_TTL = 60;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly restaurantsService: RestaurantsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly cache: CacheService,
  ) {}

  /**
   * One call that answers "what can I eat / where can I eat it".
   *
   * Restaurant and dish search share the same relevance engine and the same
   * catalogue filters as Explore (active + verified + not deleted), so anything
   * discoverable in Explore is findable in search and vice versa, and every hit
   * carries a valid restaurantId for navigation.
   */
  /** Below this length a query is treated as "still typing" (no result spam). */
  private static readonly MIN_QUERY_LENGTH = 2;

  async search(options: UnifiedSearchOptions): Promise<UnifiedSearchResult> {
    const plan = buildSearchPlan(options.q, FOOD_VOCABULARY_UNIQUE);
    const limit = Math.min(Math.max(1, Math.floor(options.limit ?? 20)), 50);
    const requestedType = options.type ?? 'all';

    // A single character matches almost the whole catalogue (ILIKE '%a%'), which
    // is both useless to the customer and wasteful. Answer with suggestions only.
    if (plan.query.length < SearchService.MIN_QUERY_LENGTH) {
      return {
        query: plan.query,
        restaurants: [],
        dishes: [],
        counts: { restaurants: 0, dishes: 0 },
        didYouMean: [],
        suggestions: await this.suggest(plan.query, 6).catch(() => []),
      };
    }

    const cacheKey = `search:unified:${CacheService.hashOptions({
      q: plan.query,
      limit,
      type: requestedType,
      lat: options.lat != null ? Math.round(options.lat * 100) / 100 : null,
      lng: options.lng != null ? Math.round(options.lng * 100) / 100 : null,
      publicOnly: options.publicOnly ?? true,
    })}`;

    return this.cache.wrap(cacheKey, this.SEARCH_TTL, async () => {
      const publicOnly = options.publicOnly ?? true;

      const wantRestaurants = requestedType !== 'dishes';
      const wantDishes = requestedType !== 'restaurants';

      const [restaurantResult, dishResult] = await Promise.all([
        wantRestaurants
          ? this.restaurantsService
              .findAll({
                search: plan.query,
                page: 1,
                limit,
                isVerified: publicOnly ? true : undefined,
                isActive: publicOnly ? true : undefined,
                lat: options.lat,
                lng: options.lng,
              })
              .catch((error: any) => {
                this.logger.warn(
                  `Restaurant search failed: ${error?.message ?? error}`,
                );
                return { data: [] as RestaurantResponseDto[], total: 0 };
              })
          : Promise.resolve({ data: [] as RestaurantResponseDto[], total: 0 }),
        wantDishes
          ? this.menuItemsService
              .search({
                q: plan.query,
                page: 1,
                limit,
                lat: options.lat,
                lng: options.lng,
                onlyAvailable: publicOnly,
              })
              .catch((error: any) => {
                this.logger.warn(
                  `Dish search failed: ${error?.message ?? error}`,
                );
                return {
                  data: [] as MenuItemSearchResultDto[],
                  total: 0,
                  didYouMean: [],
                };
              })
          : Promise.resolve({
              data: [] as MenuItemSearchResultDto[],
              total: 0,
              didYouMean: [] as string[],
            }),
      ]);

      // Attach the real distance so the UI can show "near you" without guessing.
      const origin =
        typeof options.lat === 'number' && typeof options.lng === 'number'
          ? { lat: options.lat, lng: options.lng }
          : null;
      const restaurants = origin
        ? restaurantResult.data.map((restaurant) => {
            const km = distanceKm(
              origin.lat,
              origin.lng,
              restaurant.latitude,
              restaurant.longitude,
            );
            return km === null ? restaurant : { ...restaurant, distanceKm: km };
          })
        : restaurantResult.data;

      const bothEmpty = restaurantResult.total === 0 && dishResult.total === 0;
      // Nothing matched: offer real alternatives (popular dishes/categories) so
      // the empty state is useful instead of a dead end.
      const suggestions = bothEmpty
        ? await this.suggest(plan.query, 6).catch(() => [])
        : await this.suggest(plan.query, 3).catch(() => []);

      const corrections = [
        ...dishResult.didYouMean,
        ...didYouMean(plan.query, FOOD_VOCABULARY_UNIQUE, 2),
      ];

      return {
        query: plan.query,
        restaurants,
        dishes: dishResult.data,
        counts: {
          restaurants: restaurantResult.total ?? restaurantResult.data.length,
          dishes: dishResult.total ?? dishResult.data.length,
        },
        didYouMean: [...new Set(corrections)].slice(0, 3),
        suggestions,
      };
    });
  }

  /**
   * Type-ahead suggestions drawn from real catalogue data: dish names, restaurant
   * names and menu categories, plus the genuinely most-ordered dishes when the
   * box is empty. Nothing here is invented.
   */
  async suggest(
    rawQuery: string | undefined,
    limit = 8,
  ): Promise<SearchSuggestion[]> {
    const safeLimit = Math.min(Math.max(1, Math.floor(limit)), 12);
    const plan = buildSearchPlan(rawQuery, FOOD_VOCABULARY_UNIQUE);
    const cacheKey = `search:suggest:${CacheService.hashOptions({
      q: plan.query,
      limit: safeLimit,
    })}`;

    return this.cache.wrap(cacheKey, this.SEARCH_TTL, async () => {
      const out: SearchSuggestion[] = [];

      if (!plan.allVariants.length) {
        return this.popularSuggestions(safeLimit);
      }

      const patterns = plan.allVariants.slice(0, 8).map((v) => ilikePattern(v));

      const [dishRows, categoryRows, restaurantRows] = await Promise.all([
        this.db
          .select({
            name: schema.menuItemsTable.name,
            id: schema.menuItemsTable.id,
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
              or(...patterns.map((p) => ilike(schema.menuItemsTable.name, p))),
            ),
          )
          .limit(safeLimit),
        this.db
          .selectDistinct({ name: schema.menuCategoriesTable.name })
          .from(schema.menuCategoriesTable)
          .innerJoin(
            schema.restaurantsTable,
            eq(
              schema.menuCategoriesTable.restaurantId,
              schema.restaurantsTable.id,
            ),
          )
          .where(
            and(
              eq(schema.restaurantsTable.isVerified, true),
              eq(schema.restaurantsTable.isActive, true),
              isNull(schema.restaurantsTable.deletedAt),
              or(
                ...patterns.map((p) =>
                  ilike(schema.menuCategoriesTable.name, p),
                ),
              ),
            ),
          )
          .limit(safeLimit),
        this.db
          .select({
            id: schema.restaurantsTable.id,
            name: schema.restaurantsTable.name,
          })
          .from(schema.restaurantsTable)
          .where(
            and(
              eq(schema.restaurantsTable.isVerified, true),
              eq(schema.restaurantsTable.isActive, true),
              isNull(schema.restaurantsTable.deletedAt),
              or(
                ...patterns.map((p) => ilike(schema.restaurantsTable.name, p)),
                ...patterns.map((p) =>
                  ilike(schema.restaurantsTable.cuisineType, p),
                ),
              ),
            ),
          )
          .orderBy(desc(schema.restaurantsTable.averageRating))
          .limit(safeLimit),
      ]);

      const seen = new Set<string>();
      const push = (s: SearchSuggestion) => {
        const key = normalizeText(s.label);
        if (!key || seen.has(key)) return;
        seen.add(key);
        out.push(s);
      };

      // Restaurants first (broadest intent), then categories, then dishes.
      for (const r of restaurantRows)
        push({ label: r.name, type: 'restaurant', id: r.id });
      for (const c of categoryRows) push({ label: c.name, type: 'category' });
      for (const d of dishRows)
        push({
          label: d.name,
          type: 'dish',
          id: d.id,
          restaurantName: d.restaurantName,
        });

      // Never return an empty suggestion list when the catalogue has data: fall
      // back to the genuinely most-ordered / most-present catalogue entries.
      if (out.length === 0) return this.popularSuggestions(safeLimit);

      return out.slice(0, safeLimit);
    });
  }

  /** Most-ordered dishes in the catalogue — real popularity, no seeding. */
  private async popularSuggestions(limit: number): Promise<SearchSuggestion[]> {
    try {
      const rows = await this.db
        .select({
          name: schema.menuItemsTable.name,
          total: count(schema.orderItemsTable.id),
        })
        .from(schema.menuItemsTable)
        .leftJoin(
          schema.orderItemsTable,
          eq(schema.orderItemsTable.menuItemId, schema.menuItemsTable.id),
        )
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
        .groupBy(schema.menuItemsTable.name)
        .orderBy(desc(sql`count(${schema.orderItemsTable.id})`))
        .limit(limit);

      const top = rows.filter((r) => Number(r.total) > 0);
      if (top.length >= 4) {
        return top.map((r) => ({ label: r.name, type: 'popular' as const }));
      }

      // Fresh catalogue with no order history yet: fall back to the categories
      // that actually exist instead of inventing "popular" dishes.
      const categories = await this.db
        .selectDistinct({ name: schema.menuCategoriesTable.name })
        .from(schema.menuCategoriesTable)
        .innerJoin(
          schema.restaurantsTable,
          eq(
            schema.menuCategoriesTable.restaurantId,
            schema.restaurantsTable.id,
          ),
        )
        .where(
          and(
            eq(schema.restaurantsTable.isVerified, true),
            eq(schema.restaurantsTable.isActive, true),
            isNull(schema.restaurantsTable.deletedAt),
          ),
        )
        .limit(limit);

      return categories.map((c) => ({
        label: c.name,
        type: 'category' as const,
      }));
    } catch (error: any) {
      this.logger.debug(`Popular suggestions skipped: ${error?.message}`);
      return [];
    }
  }

  /** Exposed for callers that only need keyword tokens (e.g. analytics). */
  tokenizeQuery(rawQuery: string): string[] {
    return tokenize(rawQuery);
  }
}
