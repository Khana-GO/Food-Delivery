import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';
import { useDriverStore } from '@/stores/driver/driverStore';

// Location is fetched once per query; permission is checked but not re-requested in loop if denied previously
export const useAvailableOrders = () => {
  const { setAvailableOrders, setError } = useDriverStore();

  return useQuery({
    queryKey: ['available-orders'],
    queryFn: async () => {
      try {
        const data = await driverService.getAvailableOrders();
        setAvailableOrders(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load available orders');
        throw error;
      }
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: false,
  });
};