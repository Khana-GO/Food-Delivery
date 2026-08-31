import { useQuery } from '@tanstack/react-query';
import { orderService } from '@/services/customer/order.service';
import { useOrderStore } from '@/stores/customer/orderStore';

export const useRestaurantOrders = (status?: string) => {
  const { setOrders, setError } = useOrderStore();

  return useQuery({
    queryKey: ['restaurant-orders', status],
    queryFn: async () => {
      try {
        const params: any = {};
        if (status) params.status = status;
        const data = await orderService.getOrders(params);
        // store expects {data, total, ...} shape
        if (data && typeof data === 'object' && 'data' in data) {
          setOrders(data as any);
        }
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load orders');
        throw error;
      }
    },
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
  });
};