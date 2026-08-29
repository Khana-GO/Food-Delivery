import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useToggleVerification = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.toggleVerification(id),
    onSuccess: (data, id) => {
      updateRestaurant(id, { isVerified: data.isVerified });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      Alert.alert('Success', `Restaurant ${data.isVerified ? 'verified' : 'unverified'}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to toggle verification';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
