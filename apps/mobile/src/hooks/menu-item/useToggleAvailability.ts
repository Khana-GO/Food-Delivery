import { useMutation, useQueryClient } from '@tanstack/react-query';
import { menuItemService } from '@/services/menu-item/menu-item.service';
import { useMenuItemStore } from '@/stores/menuItemStore';
import { getApiErrorMessage } from '@/lib/api-error';
import { menuItemKeys } from '@/lib/query-keys';
import { Alert } from 'react-native';
import type { InfiniteData } from '@tanstack/react-query';
import type { MenuItemsResponse } from '@food_delivery/types';

/**
 * Toggles availability with an optimistic update:
 * every cached list flips the item instantly; if the server rejects it,
 * all snapshots are rolled back and the user is told why.
 */
export const useToggleAvailability = () => {
  const queryClient = useQueryClient();
  const { toggleAvailability, setError } = useMenuItemStore();

  return useMutation({
    mutationFn: (id: string) => {
      toggleAvailability(id);
      return menuItemService.toggleAvailability(id);
    },

    onMutate: async (id) => {
      // Never let in-flight fetches overwrite our optimistic write
      await queryClient.cancelQueries({ queryKey: menuItemKeys.lists() });

      const snapshots = queryClient.getQueriesData<InfiniteData<MenuItemsResponse>>(
        { queryKey: menuItemKeys.lists() },
      );

      queryClient.setQueriesData<InfiniteData<MenuItemsResponse>>(
        { queryKey: menuItemKeys.lists() },
        (data) =>
          data
            ? {
                ...data,
                pages: data.pages.map((page) => ({
                  ...page,
                  data: page.data.map((item) =>
                    item.id === id
                      ? { ...item, isAvailable: !item.isAvailable }
                      : item,
                  ),
                })),
              }
            : data,
      );

      return { snapshots };
    },

    onError: (error: any, _id, context) => {
      // Roll every touched cache entry back to its pre-mutation state
      context?.snapshots.forEach(([key, data]) =>
        queryClient.setQueryData(key, data),
      );
      const message = getApiErrorMessage(
        error,
        'Failed to update availability',
      );
      setError(message);
      Alert.alert('Error', message);
    },

    onSettled: () => {
      // Reconcile with server truth (also refreshes count-only stats)
      queryClient.invalidateQueries({ queryKey: menuItemKeys.all });
    },
  });
};
