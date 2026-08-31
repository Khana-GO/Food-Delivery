import { adminOrderService } from '@/services/admin/order/admin-order.service';
import { useAdminOrderStore } from '@/stores/admin/adminOrderStore';
import { AdminOrderFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';

export const useAdminOrders = (filters?: AdminOrderFilters) => {
  const { setOrders, setError } = useAdminOrderStore();

  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      const data = await adminOrderService.getAllOrders(filters);
      setOrders(data);
      return data;
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to load orders');
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};