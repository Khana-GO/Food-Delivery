import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/notification/notification.service';
import { useNotificationStore } from '@/stores/notificationStore';
import { Alert } from 'react-native';

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useNotificationStore();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      markAllAsRead();
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
      Alert.alert('Success', 'All notifications marked as read');
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to mark all as read');
    },
  });
};