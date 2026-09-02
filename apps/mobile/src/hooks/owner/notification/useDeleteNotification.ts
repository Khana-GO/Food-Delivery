import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';
import { Alert } from 'react-native';

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { removeNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onMutate: async (id) => {
      // optimistic: remove immediately so double-tap cannot re-trigger backend 404
      removeNotification(id);
    },
    onSuccess: (_, id) => {
      removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any, id) => {
      const msg = error?.response?.data?.message || '';
      const isNotFound = error?.response?.status === 404 || msg.toLowerCase().includes('not found') || msg.toLowerCase().includes('already deleted');
      if (isNotFound) {
        // idempotent: already deleted on server from previous tap / another device
        removeNotification(id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        return;
      }
      Alert.alert('Error', msg || 'Failed to delete notification');
    },
  });
};