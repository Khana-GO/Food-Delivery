import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useAdminOrderStore } from '@/stores/admin/adminOrderStore';
import { adminOrderService } from '@/services/admin/order/admin-order.service';

export const useAdminUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  const { updateOrder, setError } = useAdminOrderStore();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => {
      return adminOrderService.updateStatus(id, status);
    },
    onSuccess: (data) => {
      updateOrder(data.id, { orderStatus: data.orderStatus } as any);
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-order', data.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-order-stats'] });
      Alert.alert('Success', 'Order status updated');
      router.back();
    },
    onError: (error: any) => {
      const msg = error?.response?.data?.message || 'Failed to update status';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};