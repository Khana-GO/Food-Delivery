import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';

export const useSoftDeleteRestaurant = () => {
  const queryClient = useQueryClient();
  const { removeRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.softDelete(id),
    onSuccess: (_, id) => {
      removeRestaurant(id);
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-restaurants'] });
      Alert.alert('Success', 'Restaurant deleted successfully');
      router.back();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to delete restaurant';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
