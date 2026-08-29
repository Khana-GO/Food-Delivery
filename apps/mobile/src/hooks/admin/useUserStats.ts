import { userAdminService } from '@/services/admin/user/user.service';
import { useQuery } from '@tanstack/react-query';

export const useUserStats = () => {
  return useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: async () => {
      const data = await userAdminService.getStats();
      return data;
    },
    staleTime: 0,
    gcTime: 10 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    placeholderData: (prev) => prev,
  });
};