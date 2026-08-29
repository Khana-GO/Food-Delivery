import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useRestoreRestaurant = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.restore(id),
    onSuccess: (data) => {
      updateRestaurant(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-deleted-restaurants'] });
      Alert.alert('Success', 'Restaurant restored successfully');
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to restore restaurant';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
