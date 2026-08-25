import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/category/category.service';
import { useCategoryStore } from '@/stores/categoryStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { CreateCategoryPayload } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { addCategory, setLoading, setError } = useCategoryStore();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => {
      setLoading(true);
      return categoryService.create(data);
    },
    onSuccess: (data) => {
      addCategory(data);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setLoading(false);
      Alert.alert('Success', 'Category created successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to create category');
      setError(message);
      Alert.alert('Error', message);
    },
  });
};