import { useQuery } from '@tanstack/react-query';
import { restaurantService } from '@/services/restaurant/restaurant.service';
import { useRestaurantStore } from '@/stores/restaurantStore';
import { CUISINE_TYPES } from '@food_delivery/types';

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

export const useRestaurant = (id?: string) => {
  return useQuery({
    queryKey: ['restaurants', 'detail', id],
    queryFn: () => restaurantService.getById(id!),
    enabled: Boolean(id),
    staleTime: 60 * 1000,
  });
};

/**
 * Fixed cuisine types defined by the backend. Falls back to the shared
 * constants when the request fails so the picker always works offline.
 */
export const useCuisines = () => {
  return useQuery({
    queryKey: ['restaurants', 'cuisines'],
    queryFn: () => restaurantService.getCuisines(),
    staleTime: Infinity,
    retry: false,
    initialData: [...CUISINE_TYPES],
    select: (data) => (Array.isArray(data) && data.length ? data : [...CUISINE_TYPES]),
  });
};
