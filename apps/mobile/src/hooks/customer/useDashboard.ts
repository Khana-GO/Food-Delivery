import { dashboardService } from '@/services/customer/dashboard.service';
import { useDashboardStore } from '@/stores/customer/dashboardStore';
import { useAddresses } from './useAddresses';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const useDashboard = () => {
  const { setDashboard, setLoading, setError } = useDashboardStore();

  // Location comes from the default saved address the customer already has, so
  // no extra permission prompt is needed and only the coords are shared.
  const { data: addresses } = useAddresses();
  const origin = useMemo(() => {
    const list = (addresses as any[]) || [];
    const preferred = list.find((a) => a?.isDefault) || list[0];
    const lat = Number(preferred?.latitude);
    const lng = Number(preferred?.longitude);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return undefined;
    return { lat, lng };
  }, [addresses]);

  return useQuery({
    queryKey: ['dashboard', origin?.lat ?? null, origin?.lng ?? null],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await dashboardService.getDashboard(origin);
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