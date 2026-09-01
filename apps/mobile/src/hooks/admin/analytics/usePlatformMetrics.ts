import { analyticsService } from '@/services/admin/analytics.service';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';
import { useQuery } from '@tanstack/react-query';

export const usePlatformMetrics = () => {
  const { setPlatformMetrics, setLoading, setError } = useAdminAnalyticsStore();

  return useQuery({
    queryKey: ['platform-metrics'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getPlatformMetrics();
        setPlatformMetrics(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load platform metrics');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};