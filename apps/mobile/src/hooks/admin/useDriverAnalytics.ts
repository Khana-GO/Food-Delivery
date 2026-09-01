import { analyticsService } from '@/services/admin/analytics.service';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';
import { useQuery } from '@tanstack/react-query';

export const useDriverAnalytics = (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'ASC' | 'DESC') => {
  const { setDriverAnalytics, setLoading, setError } = useAdminAnalyticsStore();

  return useQuery({
    queryKey: ['driver-analytics', page, limit, sortBy, sortOrder],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getDriverAnalytics(page, limit, sortBy, sortOrder);
        setDriverAnalytics(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load driver analytics');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
