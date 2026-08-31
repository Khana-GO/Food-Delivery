import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';
import { useDriverStore } from '@/stores/driver/driverStore';

export const useDriverActiveOrder = () => {
  const { setActiveOrder, setError } = useDriverStore();

  return useQuery({
    queryKey: ['driver-active-order'],
    queryFn: async () => {
      try {
        const data = await driverService.getActiveOrder();
        setActiveOrder(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load active order');
        throw error;
      }
    },
    staleTime: 15_000,
    refetchInterval: 20_000,
    refetchOnWindowFocus: false,
  });
};