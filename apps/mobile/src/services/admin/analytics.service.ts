import { api } from '@/lib/axios';
import { PlatformMetrics, RestaurantAnalytics, DriverAnalytics } from '@food_delivery/types';

export const analyticsService = {
  // ─── PLATFORM METRICS ───
  async getPlatformMetrics(): Promise<PlatformMetrics> {
    const res = await api.get('/analytics/platform');
    return res.data;
  },

  // ─── RESTAURANT ANALYTICS ───
  async getRestaurantAnalytics(
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<{ data: RestaurantAnalytics[]; total: number; page: number; limit: number; totalPages: number }> {
    const res = await api.get('/analytics/restaurants', {
      params: { page: page.toString(), limit: limit.toString(), sortBy, sortOrder },
    });
    return res.data;
  },

  // ─── DRIVER ANALYTICS ───
  async getDriverAnalytics(
    page: number = 1,
    limit: number = 10,
    sortBy?: string,
    sortOrder?: 'ASC' | 'DESC',
  ): Promise<{ data: DriverAnalytics[]; total: number; page: number; limit: number; totalPages: number }> {
    const res = await api.get('/analytics/drivers', {
      params: { page: page.toString(), limit: limit.toString(), sortBy, sortOrder },
    });
    return res.data;
  }
};
