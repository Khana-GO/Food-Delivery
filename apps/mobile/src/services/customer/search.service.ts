import { api } from '@/lib/axios';
import type { MenuItem, Restaurant } from '@food_delivery/types';

/** A dish search hit enriched with the selling restaurant (so links always work). */
export interface DishSearchResult extends MenuItem {
  restaurantName: string;
  restaurantSlug?: string;
  restaurantLogoUrl?: string;
  restaurantCoverImageUrl?: string;
  restaurantCuisineType?: string;
  restaurantIsOpen: boolean;
  restaurantRating: number;
  restaurantTotalReviews: number;
  restaurantDeliveryFee: number;
  restaurantEstimatedDeliveryTime?: number;
  restaurantAddress?: string;
  categoryName?: string;
  relevanceScore?: number;
  popularity?: number;
}

export type SearchSuggestionType =
  | 'dish'
  | 'restaurant'
  | 'category'
  | 'popular';

export interface SearchSuggestion {
  label: string;
  type: SearchSuggestionType;
  id?: string;
  restaurantName?: string;
}

export interface UnifiedSearchResponse {
  query: string;
  restaurants: Restaurant[];
  dishes: DishSearchResult[];
  counts: { restaurants: number; dishes: number };
  didYouMean: string[];
  suggestions: SearchSuggestion[];
}

export interface SearchParams {
  q: string;
  limit?: number;
  lat?: number;
  lng?: number;
  type?: 'all' | 'restaurants' | 'dishes';
  /** AbortSignal so typing quickly cancels stale requests instead of racing. */
  signal?: AbortSignal;
}

const EMPTY: UnifiedSearchResponse = {
  query: '',
  restaurants: [],
  dishes: [],
  counts: { restaurants: 0, dishes: 0 },
  didYouMean: [],
  suggestions: [],
};

/** Requests shorter than this are not worth a round-trip (matches the API). */
export const MIN_SEARCH_LENGTH = 2;

export const searchService = {
  /**
   * Restaurant + dish search in a single request (one call instead of several,
   * so no duplicate/parallel requests while typing).
   */
  search: async (params: SearchParams): Promise<UnifiedSearchResponse> => {
    const q = params.q?.trim() ?? '';
    if (q.length < MIN_SEARCH_LENGTH) return EMPTY;

    const response = await api.get<UnifiedSearchResponse>('/search', {
      params: {
        q,
        limit: params.limit ?? 20,
        ...(params.lat !== undefined && params.lng !== undefined
          ? { lat: params.lat, lng: params.lng }
          : {}),
        ...(params.type ? { type: params.type } : {}),
      },
      signal: params.signal,
    });
    return response.data ?? EMPTY;
  },

  /** Type-ahead suggestions from real dishes, venues and categories. */
  suggestions: async (
    q?: string,
    limit = 8,
    signal?: AbortSignal,
  ): Promise<SearchSuggestion[]> => {
    const response = await api.get<{ suggestions: SearchSuggestion[] }>(
      '/search/suggestions',
      { params: { q: q?.trim() ?? '', limit }, signal },
    );
    return response.data?.suggestions ?? [];
  },
};
