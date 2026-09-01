import { adminOrderService } from '@/services/admin/order/admin-order.service';
import { useAdminOrderStore } from '@/stores/admin/adminOrderStore';
import { AdminOrderFilters } from '@food_delivery/types';
import { useQuery } from '@tanstack/react-query';

export const useAdminOrders = (filters?: AdminOrderFilters) => {
  const { setOrders, setError } = useAdminOrderStore();

  return useQuery({
    queryKey: ['admin-orders', filters],
    queryFn: async () => {
      try {
        const data = await adminOrderService.getAllOrders(filters);
        setOrders(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load orders');
        throw error;
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: false,
  });
};
