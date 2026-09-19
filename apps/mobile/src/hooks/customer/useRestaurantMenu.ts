import { menuItemService, GroupedMenuItem } from '@/services/customer/menu-item.service';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export const useRestaurantMenu = (restaurantId: string) => {
  return useQuery({
    queryKey: ['restaurant-menu', restaurantId],
    queryFn: async (): Promise<GroupedMenuItem[]> => {
      if (!restaurantId) return [];
      const data = await menuItemService.getGroupedByRestaurant(restaurantId);

      // If any group is missing its real category name, fetch actual categories
      // from the backend and fill the names in so the UI filters correctly.
      const missingNames = data.some((g) => !g.categoryName);
      if (missingNames && restaurantId) {
        try {
          const res = await api.get(`/categories/restaurant/${restaurantId}`);
          const categories: { id: string; name: string }[] = res.data || [];
          const nameById = new Map(categories.map((c) => [c.id, c.name]));
          return data.map((g) => ({
            ...g,
            categoryName: g.categoryName || nameById.get(g.categoryId) || 'Menu',
          }));
        } catch {
          return data;
        }
      }

      return data;
    },
    enabled: !!restaurantId,  // only run the query if restaurantId is truthy
    staleTime: 5 * 60 * 1000, // 5 minutes  , Consider this menu data fresh for 5 minutes.
  });
};