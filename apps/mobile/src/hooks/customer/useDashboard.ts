import { dashboardService } from '@/services/customer/dashboard.service';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useQuery } from '@tanstack/react-query';

export const useDashboard = () => {
  const { setDashboard, setLoading, setError } = useDashboardStore();

  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboard();
        setDashboard(data);
        return data;
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load dashboard';
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};