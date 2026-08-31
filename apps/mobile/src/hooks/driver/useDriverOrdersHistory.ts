import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';
import { useDriverStore } from '@/stores/driver/driverStore';

export const useDriverOrdersHistory = (limit: number = 20) => {
  const { setOrderHistory, setError } = useDriverStore();

  return useQuery({
    queryKey: ['driver-order-history', limit],
    queryFn: async () => {
      try {
        const data = await driverService.getOrderHistory(limit);
        setOrderHistory(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load order history');
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};