import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useNotificationStore } from '@/stores/owner/notificationStore';

export const useNotifications = (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}) => {
  const { setNotifications, setLoading, setError } = useNotificationStore();

  return useQuery({
    queryKey: ['notifications', params],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await notificationService.getMyNotifications(params);
        setNotifications(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to fetch notifications');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    refetchInterval: 5000, // real-time polling every 5s for owner
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
  });
};