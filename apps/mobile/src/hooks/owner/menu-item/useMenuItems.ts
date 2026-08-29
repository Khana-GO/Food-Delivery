import { useQuery } from '@tanstack/react-query';
import { menuItemService } from '@/services/owner/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/owner/menuItemStore';
import { getApiErrorMessage } from '@/lib/api-error';
import type { MenuItemFilters } from '@food_delivery/types';
import { menuItemKeys } from '@/lib/query-keys';

export const useMenuItems = (restaurantId: string, filters?: MenuItemFilters) => {
  const { setItems, setLoading, setError } = useMenuItemStore();

  return useQuery({
    queryKey: menuItemKeys.list(restaurantId, filters),
    queryFn: async () => {
      if (!restaurantId) return null;
      setLoading(true);
      try {
        const data = await menuItemService.getByRestaurant(restaurantId, filters);
        setItems(data);
        return data;
      } catch (error: any) {
        setError(getApiErrorMessage(error, 'Failed to fetch menu items'));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!restaurantId,
  });
};