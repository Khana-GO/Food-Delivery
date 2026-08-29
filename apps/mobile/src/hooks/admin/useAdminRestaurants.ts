import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { RestaurantFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useAdminRestaurants = (filters?: RestaurantFilters, opts?: { enabled?: boolean }) => {
  const { setRestaurants, setError } = useRestaurantStore();
  const enabled = opts?.enabled ?? true;

  const query = useQuery({
    queryKey: ['admin-restaurants', filters],
    queryFn: () => restaurantAdminService.getAll(filters),
    enabled,
    staleTime: 30 * 1000,
    placeholderData: (prev) => prev,
  });

  useEffect(() => {
    if (enabled && query.data) setRestaurants(query.data);
  }, [enabled, query.data, setRestaurants]);

  useEffect(() => {
    if (enabled && query.error) {
      const msg = (query.error as any)?.response?.data?.message || 'Failed to fetch restaurants';
      setError(msg);
    }
  }, [enabled, query.error, setError]);

  return query;
};
