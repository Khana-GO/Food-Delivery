import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';

export const useUpdateRestaurant = () => {
  const queryClient = useQueryClient();
  const { updateRestaurant, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => restaurantAdminService.update(id, data),
    onSuccess: (data) => {
      updateRestaurant(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-restaurant-stats'] });
      Alert.alert('Success', 'Restaurant updated successfully');
      if (router.canGoBack()) router.back();
      setTimeout(() => {
        try { router.replace('/(admin)/(tabs)/restaurants' as any); } catch {}
      }, 100);
    },
    onError: (error: any) => {
      const msg = Array.isArray(error?.response?.data?.message)
        ? error.response.data.message.join(', ')
        : error?.response?.data?.message || 'Failed to update restaurant';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
