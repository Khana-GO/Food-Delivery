import { useMutation } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import { useOrderStore } from '@/stores/customer/orderStore';
import { useCartStore } from '@/stores/customer/cartStore';
import { orderService } from '@/services/customer/order.service';
import { getApiErrorMessage, isPhoneRequiredError } from '@/lib/api-error';

interface UseCreateOrderOptions {
  /**
   * Called when the API rejects the order because the account has no phone
   * number (Google sign-ups). Screens use it to open the "add phone number"
   * prompt instead of showing a dead-end error alert.
   */
  onPhoneRequired?: () => void;
}

export const useCreateOrder = (options: UseCreateOrderOptions = {}) => {
  const { addOrder, setLoading, setError } = useOrderStore();
  const { clearCart } = useCartStore();
  const { onPhoneRequired } = options;

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

      if (isPhoneRequiredError(error)) {
        setError('Phone number required');
        onPhoneRequired?.();
        return;
      }

      const msg = getApiErrorMessage(error, 'Failed to place order');
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};
