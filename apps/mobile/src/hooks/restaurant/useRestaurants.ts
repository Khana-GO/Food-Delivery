import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';

export const useMyRestaurants = () => {
  const { setRestaurants, setLoading, setError } = useRestaurantStore();

  return useQuery({
    queryKey: ['restaurants', 'my'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await restaurantService.getMyRestaurants();
        setRestaurants(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to fetch restaurants');
        throw error;
      } finally {
        setLoading(false);
      }
    },
  });
};