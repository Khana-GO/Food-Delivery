import { useQuery } from '@tanstack/react-query';
import { menuItemService } from '@/services/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/menuItemStore';
import { getApiErrorMessage } from '@/lib/api-error';
import { menuItemKeys } from '@/lib/query-keys';

export const useMenuItem = (id: string) => {
  const { setCurrentItem, setLoading, setError } = useMenuItemStore();

  return useQuery({
    queryKey: menuItemKeys.detail(id),
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await menuItemService.getById(id);
        setCurrentItem(data);
        return data;
      } catch (error: any) {
        setError(getApiErrorMessage(error, 'Failed to fetch menu item'));
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
  });
};