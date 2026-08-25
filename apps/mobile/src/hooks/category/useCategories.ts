import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { useCategoryStore } from '@/stores/categoryStore';
import { getApiErrorMessage } from '@/lib/api-error';
import { categoryKeys } from '@/lib/query-keys';

/**
 * Fetches the categories of the owner's own restaurant.
 *
 * The restaurant is resolved on the backend from the JWT (same logic as
 * create/update/delete), so the list always matches what mutations write to.
 */
export const useCategories = (includeItemCount: boolean = true) => {
  const { setCategories, setLoading, setError } = useCategoryStore();

  return useQuery({
    queryKey: categoryKeys.mine(includeItemCount),
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await categoryService.getMine(includeItemCount);
        setCategories(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to fetch categories');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    // Always pull fresh data so new categories appear when returning
    // from the create-category screen
    refetchOnMount: 'always',
  });
};
