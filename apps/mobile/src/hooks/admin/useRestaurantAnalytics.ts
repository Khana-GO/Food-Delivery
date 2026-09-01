import { analyticsService } from '@/services/admin/analytics.service';
import { useAdminAnalyticsStore } from '@/stores/admin/adminAnalyticsStore';
import { useQuery } from '@tanstack/react-query';

export const useRestaurantAnalytics = (page: number = 1, limit: number = 10, sortBy?: string, sortOrder?: 'ASC' | 'DESC') => {
  const { setRestaurantAnalytics, setLoading, setError } = useAdminAnalyticsStore();

  return useQuery({
    queryKey: ['restaurant-analytics', page, limit, sortBy, sortOrder],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await analyticsService.getRestaurantAnalytics(page, limit, sortBy, sortOrder);
        setRestaurantAnalytics(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load restaurant analytics');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
