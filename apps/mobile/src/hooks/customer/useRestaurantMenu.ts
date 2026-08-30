import { menuItemService } from '@/services/customer/menu-item.service';
import { useQuery } from '@tanstack/react-query';

export const useRestaurantMenu = (restaurantId: string) => {
  return useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const data = await menuItemService.getGroupedByRestaurant(restaurantId);
      return data;
    },
    enabled: !!restaurantId,  // only run the query if restaurantId is truthy
    staleTime: 5 * 60 * 1000, // 5 minutes  , Consider this menu data fresh for 5 minutes.
  });
};