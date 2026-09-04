import { useQuery } from '@tanstack/react-query';
import { exportService } from '@/services/admin/export.service';
import { SalesReport, SalesReportPeriod } from '@food_delivery/types';

export const useSalesReport = (period: SalesReportPeriod, date?: string) => {
  return useQuery({
    queryKey: ['sales-report', period, date],
    queryFn: () => exportService.getSalesReport(period, date),
    staleTime: 5 * 60 * 1000,
  });
};

export type { SalesReport, SalesReportPeriod };
