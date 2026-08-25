import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';
import { toast } from '@/components/ui/toast';

export const useCreateRestaurant = () => {
  const queryClient = useQueryClient();
  const { addRestaurant, setLoading, setError } = useRestaurantStore();

  return useMutation({
    mutationFn: (data: CreateRestaurantPayload) => {
      setLoading(true);
      setError(null);
      return restaurantService.create(data);
    },
    onSuccess: (data) => {
      addRestaurant(data);
      queryClient.invalidateQueries({ queryKey: ['restaurants', 'my'] });
      setLoading(false);
      toast.success('Now add your logo and cover photo.', 'Restaurant created');
    },
    onError: (error: any) => {
      setLoading(false);
      setError(error?.response?.data?.message || 'Failed to create restaurant');
      toast.error(
        error?.response?.data?.message || 'Failed to create restaurant',
        'Could not create',
      );
    },
  });
};
