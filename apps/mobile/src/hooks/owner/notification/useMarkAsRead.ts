import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';
import { Alert } from 'react-native';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      markAsRead(id);
    },
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any, id) => {
      const msg = error?.response?.data?.message || '';
      const isNotFound = error?.response?.status === 404 || msg.toLowerCase().includes('not found');
      if (isNotFound) {
        markAsRead(id);
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
        queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        return;
      }
      Alert.alert('Error', msg || 'Failed to mark as read');
    },
  });
};