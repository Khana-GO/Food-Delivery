import { restaurantAdminService } from '@/services/admin/restaurant/restaurant-admin.service';
import { RestaurantFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';

export const useDeletedRestaurants = (filters?: RestaurantFilters, opts?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ['admin-deleted-restaurants', filters],
    queryFn: () => restaurantAdminService.getDeleted(filters),
    enabled: opts?.enabled ?? true,
    staleTime: 60 * 1000,
  });
};
