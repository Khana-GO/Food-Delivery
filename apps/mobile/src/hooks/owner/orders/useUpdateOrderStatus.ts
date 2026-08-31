import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderService } from '@/services/customer/order.service';
import { useOrderStore } from '@/stores/customer/orderStore';
import { Alert } from 'react-native';

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { updateOrder, setLoading, setError } = useOrderStore();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      setLoading(true);
      return orderService.updateStatus(id, { orderStatus: status });
    },
    onSuccess: (data) => {
      updateOrder(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['restaurant-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', data.id] });
      setLoading(false);
      Alert.alert('Success', 'Order status updated');
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to update status';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};