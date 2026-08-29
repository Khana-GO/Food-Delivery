import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useToggleOpen = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (id: string) => restaurantAdminService.toggleOpen(id),
    onSuccess: (data, id) => {
      updateRestaurant(id, { isOpen: data.isOpen });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', id] });
      Alert.alert('Success', `Restaurant ${data.isOpen ? 'opened' : 'closed'}`);
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to toggle open';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
