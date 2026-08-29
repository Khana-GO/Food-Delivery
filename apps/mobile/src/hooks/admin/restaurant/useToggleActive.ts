import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useToggleActive = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.toggleActive(id),
    onSuccess: (data, id) => {
      updateRestaurant(id, { isActive: data.isActive });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      Alert.alert('Success', `Restaurant ${data.isActive ? 'activated' : 'deactivated'}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to toggle active status';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
