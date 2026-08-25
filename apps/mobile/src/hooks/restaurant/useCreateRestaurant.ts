import { useMutation, useQueryClient } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CreateRestaurantPayload } from '@food_delivery/types';
import { toast } from '@/components/ui/toast';
import { getApiErrorMessage } from '@/lib/api-error';
import { restaurantKeys } from '@/lib/query-keys';

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
      queryClient.invalidateQueries({ queryKey: restaurantKeys.all });
      setLoading(false);
      toast.success('Now add your logo and cover photo.', 'Restaurant created');
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to create restaurant');
      setError(message);
      toast.error(message, 'Could not create');
    },
  });
};
