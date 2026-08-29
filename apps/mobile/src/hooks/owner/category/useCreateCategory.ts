import { useMutation, useQueryClient } from '@tanstack/react-query';
import { categoryService } from '@/services/owner/category/category.service';
import { useCategoryStore } from '@/stores/owner/categoryStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { CreateCategoryPayload } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { categoryKeys } from '@/lib/query-keys';

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  const { addCategory, setLoading, setError } = useCategoryStore();

  return useMutation({
    mutationFn: (data: CreateCategoryPayload) => {
      setLoading(true);
      return categoryService.create(data);
    },
    onSuccess: async (data) => {
      addCategory(data);
      // Ensure all category lists (mine, mineAll, byRestaurant) refetch immediately
      await queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      // Also refetch the newly created restaurant's categories explicitly for instant menu-form availability
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(data.restaurantId, false),
      });
      await queryClient.invalidateQueries({
        queryKey: categoryKeys.byRestaurant(data.restaurantId, true),
      });
      // Real-time notifications
      await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      await queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      setLoading(false);
      // Redirect to the full categories list — not just back (which may go to menu form)
      // This satisfies: owner can create per restaurant, immediately visible, and navigation is deterministic.
      router.replace('/(restaurant-owner)/categories' as never);
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to create category');
      setError(message);
      Alert.alert('Error', message);
    },
  });
};