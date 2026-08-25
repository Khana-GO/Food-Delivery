import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { useCategoryStore } from '@/stores/categoryStore';
import { Alert } from 'react-native';
import { getApiErrorMessage } from '@/lib/api-error';

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  const { removeCategory, setLoading, setError } = useCategoryStore();

  return useMutation({
    mutationFn: (id: string) => {
      setLoading(true);
      return categoryService.delete(id);
    },
    onSuccess: (_, id) => {
      removeCategory(id);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', id] });
      Alert.alert('Success', 'Category deleted successfully');
    },
    onError: (error: any) => {
      const message =
        getApiErrorMessage(error, 'Failed to delete category');
      setError(message);
      Alert.alert('Error', message);
    },
    onSettled: () => setLoading(false),
  });
};
