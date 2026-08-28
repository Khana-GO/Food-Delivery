import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification/notification.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { Alert } from 'react-native';

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: (_, id) => {
      markAsRead(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to mark as read');
    },
  });
};