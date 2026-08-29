import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/owner/category/category.service';
import { useCategoryStore } from '@/stores/owner/categoryStore';
import { categoryKeys } from '@/lib/query-keys';

/**
 * Fetches ALL categories across all restaurants owned by the current user.
 * Uses GET /categories/my/all which aggregates per restaurant on backend,
 * so the list is complete for multi-restaurant owners and updates
 * immediately after creation via query invalidation.
 */
export const useAllOwnerCategories = (includeItemCount: boolean = true) => {
  const { setCategories, setLoading, setError } = useCategoryStore();

  return useQuery({
    queryKey: categoryKeys.mineAll(includeItemCount),
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await categoryService.getAllForOwner(includeItemCount);
        setCategories(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to fetch categories');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchOnMount: 'always',
  });
};
