import { orderService } from '@/services/customer/order.service';
import { useOrderStore } from '@/stores/customer/orderStore';
import { useQuery } from '@tanstack/react-query';

export const useOrders = (filters?: { status?: string; page?: number; limit?: number }) => {
  const { setOrders, setLoading, setError } = useOrderStore();

  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrders(filters);
        setOrders(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load orders');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 60 * 1000,
  });
};