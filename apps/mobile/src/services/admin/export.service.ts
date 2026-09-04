import { api } from '@/lib/axios';
import { SalesReport, SalesReportPeriod } from '@food_delivery/types';

export const exportService = {
  // ─── SALES REPORT ───
  async getSalesReport(
    period: SalesReportPeriod,
    date?: string,
  ): Promise<SalesReport> {
    const response = await api.get('/export/sales', {
      params: { period, date },
    });
    return response.data;
  },

  // ─── EXPORT ORDERS AS CSV ───
  async exportOrdersCSV(filters?: {
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
    status?: string;
  }): Promise<string> {
    const response = await api.get('/export/orders/csv', {
      params: filters,
      responseType: 'text',
    });
    return response.data;
  },
};
