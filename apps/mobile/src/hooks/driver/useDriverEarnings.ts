import { useQuery } from '@tanstack/react-query';
import { driverService } from '@/services/driver/driver.service';

export const useDriverEarnings = () => {
  return useQuery({
    queryKey: ['driver-earnings'],
    queryFn: async () => {
      const data = await driverService.getEarnings();
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};