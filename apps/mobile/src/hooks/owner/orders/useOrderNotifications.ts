import { useEffect } from 'react';
import { router } from 'expo-router';
import { webSocketService } from '@/services/tracking/websocket.service';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useOrderNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    // Connect WebSocket for restaurant owner
    webSocketService.connect(user.id);

    const handleNewOrder = (data: any) => {
      Alert.alert('New Order!', `Order #${data.id.slice(0, 8)} received`, [
        { text: 'View', onPress: () => router.push(`/(restaurant-owner)/restaurant/orders/${data.id}` as any) },
        { text: 'OK' },
      ]);
      // Refetch orders list
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    };

    const handleOrderUpdate = (data: any) => {
      // Update order in cache if needed
      queryClient.invalidateQueries({ queryKey: ['order', data.orderId] });
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
    };

    webSocketService.on('new-order', handleNewOrder);
    webSocketService.on('order-updated', handleOrderUpdate);

    return () => {
      webSocketService.off('new-order', handleNewOrder);
      webSocketService.off('order-updated', handleOrderUpdate);
    };
  }, [user]);
};