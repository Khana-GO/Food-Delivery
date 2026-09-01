import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { Alert } from 'react-native';

export const useDriverMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { markAllAsRead } = useDriverNotificationStore();

  return useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: () => markAllAsRead(),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to mark all as read');
    },
  });
};
