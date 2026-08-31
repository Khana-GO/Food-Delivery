import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/owner/notification/notification.service';
import { useDriverNotificationStore } from '@/stores/driver/driverNotificationStore';
import { webSocketService } from '@/services/tracking/websocket.service';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useDriverNotifications = () => {
  const { user } = useAuth();
  const { setNotifications, addNotification, setUnreadCount, setLoading, setError } = useDriverNotificationStore();

  // ─── Fetch notifications ───
  const query = useQuery({
    queryKey: ['driver-notifications'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await notificationService.getMyNotifications({ limit: 50 });
        setNotifications(data.data);
        setUnreadCount(data.data.filter((n: any) => !n.isRead).length);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load notifications');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 2 * 60 * 1000,
  });

  // ─── WebSocket for real-time notifications ───
  useEffect(() => {
    if (!user?.id) return;

    webSocketService.connect(user.id);

    const handleNewNotification = (data: any) => {
      // Show alert for important driver notifications
      if (data.type === 'order' || data.type === 'delivery') {
        Alert.alert(data.title, data.body, [
          { text: 'View', onPress: () => router.push('/(driver)/(tabs)/notifications') },
          { text: 'OK' },
        ]);
      }
      addNotification(data);
    };

    const handleDriverAssigned = (data: any) => {
      Alert.alert('New Delivery Assignment', `Order #${data.orderId.slice(0, 8)} assigned to you`, [
        { text: 'View', onPress: () => router.push(`/(driver)/delivery/${data.orderId}` as any) },
        { text: 'OK' },
      ]);
      addNotification({ id: data.orderId, title: 'New Delivery', body: `Order #${data.orderId.slice(0, 8)}`, type: 'order', isRead: false, createdAt: new Date().toISOString() } as any);
    };
    webSocketService.on('new-notification', handleNewNotification);
    webSocketService.on('driver-assigned', handleDriverAssigned);

    return () => {
      webSocketService.off('new-notification', handleNewNotification);
      webSocketService.off('driver-assigned', handleDriverAssigned);
    };
  }, [user]);

  return query;
};