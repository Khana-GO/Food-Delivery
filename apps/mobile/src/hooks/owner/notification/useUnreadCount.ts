import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';

export const useUnreadCount = () => {
  const { setUnreadCount, setError } = useNotificationStore();

  return useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      try {
        const data = await notificationService.getUnreadCount();
        setUnreadCount(data.count);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to fetch unread count');
        throw error;
      }
    },
    refetchInterval: 5000, // real-time: 5s polling for instant badge update
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  });
};