import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';

export const useHardDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  const { removeRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.permanentDelete(id),
    onSuccess: (_, id) => {
      removeRestaurant(id);
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      Alert.alert('Success', 'Restaurant permanently deleted');
      router.back();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to permanently delete';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
