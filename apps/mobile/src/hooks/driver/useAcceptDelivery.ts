import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';
import { useDriverStore } from '@/stores/driver/driverStore';
import { useAuth } from '@/contexts/AuthContext';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useAcceptDelivery = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { removeAvailableOrder, setActiveOrder, setLoading, setError } = useDriverStore();

  return useMutation({
    mutationFn: (orderId: string) => {
      setLoading(true);
      return driverService.acceptDelivery(orderId, user?.id);
    },
    onSuccess: (data) => {
      removeAvailableOrder(data.id);
      setActiveOrder(data);
      queryClient.invalidateQueries({ queryKey: ['available-orders'] });
      queryClient.invalidateQueries({ queryKey: ['driver-active-order'] });
      setLoading(false);
      Alert.alert('Delivery Accepted', `Order #${data.id.slice(0, 8).toUpperCase()} accepted. Opening map...`, [
        { text: 'View Map', onPress: () => router.push('/(driver)/(tabs)/active' as any) },
        { text: 'OK', onPress: () => router.push('/(driver)/(tabs)/active' as any) },
      ]);
      // Auto-redirect to map (active page with map)
      setTimeout(() => router.push('/(driver)/(tabs)/active' as any), 300);
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to accept delivery';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};