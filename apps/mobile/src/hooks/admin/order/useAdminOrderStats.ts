import { adminOrderService } from '@/services/admin/order/admin-order.service';
import { useAdminOrderStore } from '@/stores/admin/adminOrderStore';
import { useQuery } from '@tanstack/react-query';

export const useAdminOrderStats = () => {
  const { setStats, setError } = useAdminOrderStore();

  return useQuery({
    queryKey: ['admin-order-stats'],
    queryFn: async () => {
      const data = await adminOrderService.getStats();
      setStats(data);
      return data;
    },
    onError: (error: any) => {
      setError(error?.response?.data?.message || 'Failed to load stats');
    },
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
};