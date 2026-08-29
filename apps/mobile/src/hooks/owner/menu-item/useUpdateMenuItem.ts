import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemService } from '@/services/owner/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/owner/menuItemStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { UpdateMenuItemPayload } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { menuItemKeys } from '@/lib/query-keys';

export const useUpdateMenuItem = () => {
  const queryClient = useQueryClient();
  const { updateItem, setLoading, setError } = useMenuItemStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMenuItemPayload }) => {
      setLoading(true);
      return menuItemService.update(id, data);
    },
    onSuccess: (data) => {
      updateItem(data.id, data);
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
      queryClient.invalidateQueries({ queryKey: menuItemKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      setLoading(false);
      Alert.alert('Success', 'Menu item updated successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to update menu item');
      setError(message);
      Alert.alert('Error', message);
    },
  });
};