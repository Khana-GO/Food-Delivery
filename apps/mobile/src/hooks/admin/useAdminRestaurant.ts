import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useRestaurantStore } from '@/stores/admin/restaurantStore';
import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';

export const useAdminRestaurant = (id: string) => {
  const { setCurrentRestaurant, setError } = useRestaurantStore();

  const query = useQuery({
    queryKey: ['admin-restaurant', id],
    queryFn: () => restaurantAdminService.getOne(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });

  useEffect(() => {
    if (query.data) setCurrentRestaurant(query.data);
  }, [query.data, setCurrentRestaurant]);

  useEffect(() => {
    if (query.error) {
      const msg = (query.error as any)?.response?.data?.message || 'Failed to fetch restaurant';
      setError(msg);
    }
  }, [query.error, setError]);

  return query;
};
