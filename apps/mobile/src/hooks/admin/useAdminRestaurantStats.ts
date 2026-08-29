import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { useQuery } from '@tanstack/react-query';

export const useAdminRestaurantStats = () => {
  return useQuery({
    queryKey: ['admin-restaurant-stats'],
    queryFn: async () => {
      const data = await restaurantAdminService.getStats();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};