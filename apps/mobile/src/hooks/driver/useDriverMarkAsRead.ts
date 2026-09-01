import { useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { Alert } from 'react-native';

export const useDriverMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { markAsRead } = useDriverNotificationStore();

  return useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: (id) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['driver-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error?.response?.data?.message || 'Failed to mark as read');
    },
  });
};
