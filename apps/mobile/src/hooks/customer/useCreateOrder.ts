import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useOrderStore } from '@/stores/customer/orderStore';
import { useCartStore } from '@/stores/customer/cartStore';
import { orderService } from '@/services/customer/order.service';

export const useCreateOrder = () => {
  const { addOrder, setLoading, setError } = useOrderStore();
  const { clearCart } = useCartStore();

  return useMutation({
    mutationFn: (data: any) => {
      setLoading(true);
      return orderService.create(data);
    },
    onSuccess: (data) => {
      addOrder(data);
      clearCart();
      setLoading(false);
      router.push(`/(customer)/order-confirmation?id=${data.id}` as any);
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to place order';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};