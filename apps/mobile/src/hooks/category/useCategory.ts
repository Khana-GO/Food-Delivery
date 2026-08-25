import { useQuery } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { useCategoryStore } from '@/stores/categoryStore';
import { getApiErrorMessage } from '@/lib/api-error';

export const useCategory = (id: string) => {
  const { setCurrentCategory, setLoading, setError } = useCategoryStore();

  return useQuery({
    queryKey: ['category', id],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await categoryService.getById(id);
        setCurrentCategory(data);
        return data;
      } catch (error: any) {
        setError(getApiErrorMessage(error, 'Failed to fetch category'));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
  });
};