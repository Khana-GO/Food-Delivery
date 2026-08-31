import { adminOrderService } from '@/services/admin/order/admin-order.service';
import { useAdminOrderStore } from '@/stores/admin/adminOrderStore';
import { useQuery } from '@tanstack/react-query';

export const useAdminOrder = (id: string) => {
  const { setCurrentOrder, setError } = useAdminOrderStore();

  return useQuery({
    queryKey: ['admin-order', id],
    queryFn: async () => {
      const data = await adminOrderService.getOrder(id);
      setCurrentOrder(data);
      return data;
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to load order');
    },
    enabled: !!id,
    staleTime: 30 * 1000,
  });
};