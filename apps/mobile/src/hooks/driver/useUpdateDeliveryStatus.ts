import { useMutation, useQueryClient } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';
import { useDriverStore } from '@/stores/driver/driverStore';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useUpdateDeliveryStatus = () => {
  const queryClient = useQueryClient();
  const { updateOrder, setLoading, setError } = useDriverStore();

  return useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) => {
      setLoading(true);
      return driverService.updateDeliveryStatus(orderId, status);
    },
    onSuccess: (data) => {
      updateOrder(data.id, { orderStatus: data.orderStatus });
      queryClient.invalidateQueries({ queryKey: ['driver-active-order'] });
      queryClient.invalidateQueries({ queryKey: ['driver-order-history'] });
      queryClient.invalidateQueries({ queryKey: ['driver-earnings'] });
      setLoading(false);
      Alert.alert('Success', `Order ${data.orderStatus.toLowerCase()}`);

      if (data.orderStatus === 'DELIVERED') {
        router.push('/(driver)/(tabs)');
      }
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to update status';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};