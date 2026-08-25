import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemService } from '@/services/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/menuItemStore';
import { router } from 'expo-router';
import { Alert } from 'react-native';
import { CreateMenuItemPayload } from '@food_delivery/types';
import { getApiErrorMessage } from '@/lib/api-error';
import { menuItemKeys } from '@/lib/query-keys';

export const useCreateMenuItem = () => {
  const queryClient = useQueryClient();
  const { addItem, setLoading, setError } = useMenuItemStore();

  return useMutation({
    mutationFn: (data: CreateMenuItemPayload) => {
      setLoading(true);
      return menuItemService.create(data);
    },
    onSuccess: (data) => {
      addItem(data);
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
      setLoading(false);
      Alert.alert('Success', 'Menu item created successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const message = getApiErrorMessage(error, 'Failed to create menu item');
      setError(message);
      Alert.alert('Error', message);
    },
  });
};