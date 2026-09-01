import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { Alert } from 'react-native';

export const useDriverDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { removeNotification } = useDriverNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.delete(id),
    onSuccess: (_, id) => {
      removeNotification(id);
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete notification');
    },
  });
};

export const useDriverDeleteAllNotifications = () => {
  const queryClient = useQueryClient();
  const { clearAll } = useDriverNotificationStore();

  return useMutation({
    mutationFn: () => notificationService.deleteAll(),
    onSuccess: () => {
      clearAll();
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to delete notifications');
    },
  });
};
