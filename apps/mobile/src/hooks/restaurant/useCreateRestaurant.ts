import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { router } from 'expo-router';
import { CreateRestaurantPayload } from '@food_delivery/types';

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  const { addRestaurant, setLoading, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (data: CreateRestaurantPayload) => {
      setLoading(true);
      return restaurantService.create(data);
    },
    onSuccess: (data) => {
      addRestaurant(data);
      queryClient.invalidateQueries({ queryKey: ['restaurants', 'my'] });
      setLoading(false);
      router.replace('/(restaurant)/restaurant/profile');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error?.response?.data?.message || 'Failed to create restaurant');
    },
  });
};