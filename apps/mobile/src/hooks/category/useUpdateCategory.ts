import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { useCategoryStore } from '@/stores/categoryStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { UpdateCategoryPayload } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  const { updateCategory, setLoading, setError } = useCategoryStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryPayload }) => {
      setLoading(true);
      return categoryService.update(id, data);
    },
    onSuccess: (data) => {
      updateCategory(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['category', data.id] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      Alert.alert('Success', 'Category updated successfully');
      router.back();
    },
    onError: (error: any) => {
      const message =
        getApiErrorMessage(error, 'Failed to update category');
      setError(message);
      Alert.alert('Error', message);
    },
    onSettled: () => setLoading(false),
  });
};
