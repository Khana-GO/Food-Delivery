import { orderService } from '@/services/customer/order.service';
import { useOrderStore } from '@/stores/customer/orderStore';
import { useQuery } from '@tanstack/react-query';

export const useOrder = (id: string) => {
  const { setCurrentOrder, setLoading, setError } = useOrderStore();

  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await orderService.getOrder(id);
        setCurrentOrder(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load order');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: !!id,
    staleTime: 60 * 1000,
  });
};