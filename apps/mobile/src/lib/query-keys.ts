/**
 * Centralised React Query key management.
 *
 * Keys are hierarchical so invalidation works by prefix:
 *   invalidateQueries({ queryKey: menuItemKeys.all })      → everything
 *   invalidateQueries({ queryKey: menuItemKeys.list() })    → all lists/stats
 *   invalidateQueries({ queryKey: menuItemKeys.detail(id) })→ one item
 */

export const menuItemKeys = {
  all: ['menu-items'] as const,
  lists: () => [...menuItemKeys.all, 'list'] as const,
  list: (restaurantId: string | undefined, filters: unknown) =>
    [...menuItemKeys.lists(), restaurantId ?? 'none', filters] as const,
  details: () => [...menuItemKeys.all, 'detail'] as const,
  detail: (id: string | undefined) => [...menuItemKeys.details(), id] as const,
  /** Count-only aggregate queries (total available / unavailable). */
  stats: () => [...menuItemKeys.all, 'stats'] as const,
  stat: (restaurantId: string | undefined, bucket: 'available' | 'unavailable') =>
    [...menuItemKeys.stats(), restaurantId ?? 'none', bucket] as const,
};

export const categoryKeys = {
  all: ['categories'] as const,
  mine: (includeItemCount: boolean) =>
    [...categoryKeys.all, 'mine', includeItemCount] as const,
  byRestaurant: (restaurantId: string | undefined, includeItemCount: boolean) =>
    [...categoryKeys.all, 'restaurant', restaurantId ?? 'none', includeItemCount] as const,
};

export const restaurantKeys = {
  all: ['restaurants'] as const,
  mine: () => [...restaurantKeys.all, 'my'] as const,
};
