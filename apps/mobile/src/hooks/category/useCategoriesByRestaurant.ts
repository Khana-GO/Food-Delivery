import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { categoryKeys } from '@/lib/query-keys';

/**
 * Fetches the categories of a specific restaurant. Needed when the owner
 * has multiple restaurants: `/categories/my` always resolves to their
 * default restaurant, which may not be the one being managed.
 */
export const useCategoriesByRestaurant = (
  restaurantId?: string,
  includeItemCount: boolean = false,
) => {
  return useQuery({
    queryKey: categoryKeys.byRestaurant(restaurantId, includeItemCount),
    queryFn: () =>
      categoryService.getByRestaurant(restaurantId!, includeItemCount),
    enabled: !!restaurantId,
    // Always pull fresh data so new categories appear when returning
    // from the create-category screen
    refetchOnMount: 'always',
  });
};
