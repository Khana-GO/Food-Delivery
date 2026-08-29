import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemService } from '@/services/owner/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/owner/menuItemStore';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { getApiErrorMessage } from '@/lib/api-error';
import { menuItemKeys } from '@/lib/query-keys';

export const useDeleteMenuItem = () => {
  const queryClient = useQueryClient();
  const { removeItem, setLoading, setError } = useMenuItemStore();

  return useMutation({
    mutationFn: (id: string) => {
      setLoading(true);
      return menuItemService.delete(id);
    },
    onSuccess: (_, id) => {
      removeItem(id);
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      setLoading(false);
      Alert.alert('Success', 'Menu item deleted successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to delete menu item');
      setError(message);
      Alert.alert('Error', message);
    },
  });
};