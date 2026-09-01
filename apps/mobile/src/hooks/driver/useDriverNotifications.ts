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
      const normalized = data.notification || data.data || data;
      // Ensure required fields
      const notif = {
        id: normalized.id || `ws-${Date.now()}`,
        title: normalized.title || 'New Notification',
        body: normalized.body || normalized.message || '',
        type: normalized.type || 'system',
        isRead: false,
        createdAt: normalized.createdAt || new Date().toISOString(),
        data: normalized.data,
        ...normalized,
      } as any;
      addNotification(notif);
      // Show subtle alert only for critical driver events
      if (notif.type === 'order' || notif.type === 'delivery') {
        // Use lightweight alert - avoid blocking if many notifications
        // Alert handled via in-app banner; keep simple for now
      }
    };

    const handleDriverAssigned = (data: any) => {
      const payload = data.data || data;
      const orderId = payload.orderId || payload.id;
      if (orderId) {
        addNotification({
          id: `assign-${orderId}-${Date.now()}`,
          title: 'New Delivery Assignment',
          body: `Order #${String(orderId).slice(0, 8)} assigned to you`,
          type: 'delivery',
          isRead: false,
          createdAt: new Date().toISOString(),
          data: { orderId },
        } as any);
      }
    };

    const events = ['new-notification', 'notification', 'driver-assigned', 'driver:assigned', 'order-assigned'];
    events.forEach((ev) => {
      if (ev.includes('notification')) webSocketService.on(ev, handleNewNotification);
      else webSocketService.on(ev, handleDriverAssigned);
    });

    // Also refetch on any notification event to stay in sync
    const handleAnyNotification = () => {
      // debounce refetch via store update already; no extra fetch needed
    };

    return () => {
      events.forEach((ev) => {
        if (ev.includes('notification')) webSocketService.off(ev, handleNewNotification);
        else webSocketService.off(ev, handleDriverAssigned);
      });
    };
  }, [user?.id]);

  return query;
};