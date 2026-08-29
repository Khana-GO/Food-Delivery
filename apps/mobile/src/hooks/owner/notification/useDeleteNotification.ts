import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';
import { Alert } from 'react-native';

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { removeNotification } = useNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: (_, id) => {
      removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete notification');
    },
  });
};