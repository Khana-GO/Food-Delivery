import { api } from '@/lib/axios';
import {
  DriverLocation,
  OrderTrackingData,
  RouteData,
} from '@/types/tracking.types';

export const trackingService = {
  // ─── GET DRIVER LOCATION ───
  getDriverLocation: async (orderId: string): Promise<DriverLocation> => {
    const res = await api.get(`/tracking/location/${orderId}`);
    // API returns DriverLocationResponseDto shape with Date string
    return {
      ...res.data,
      lastUpdatedAt:
        typeof res.data.lastUpdatedAt === 'string'
          ? res.data.lastUpdatedAt
          : new Date(res.data.lastUpdatedAt).toISOString(),
    };
  },

  // ─── GET LOCATION HISTORY ───
  getLocationHistory: async (orderId: string, limit = 50) => {
    const res = await api.get(`/tracking/location/${orderId}/history`, {
      params: { limit },
    });
    return res.data as Array<{ latitude: number; longitude: number; recordedAt: string }>;
  },

  // ─── GET ORDER TRACKING DATA (advanced snapshot) ───
  getOrderTrackingData: async (orderId: string): Promise<OrderTrackingData> => {
    const res = await api.get(`/tracking/order/${orderId}`);
    // Transform if needed
    const d = res.data;
    return {
      orderId: d.orderId ?? orderId,
      driver: d.driver ?? null,
      route: d.route ?? null,
      restaurant: d.restaurant ?? { lat: 0, lng: 0 },
      delivery: d.delivery ?? { lat: 0, lng: 0 },
      orderStatus: d.orderStatus ?? 'PENDING',
      estimatedDeliveryTime: d.estimatedDeliveryTime ?? null,
      estimatedDistance: d.estimatedDistance ?? d.route?.distance ?? null,
      estimatedDuration: d.estimatedDuration ?? d.route?.duration ?? null,
      history: d.history ?? [],
    };
  },

  // ─── CALCULATE ROUTE ───
  calculateRoute: async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ): Promise<RouteData> => {
    const res = await api.get('/tracking/route/calculate', {
      params: { startLat, startLng, endLat, endLng },
    });
    return res.data;
  },

  // Fallback alias
  calculateRouteLegacy: async (
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ) => {
    const res = await api.get('/tracking/route', {
      params: { startLat, startLng, endLat, endLng },
    });
    return res.data as RouteData;
  },

  // ─── DRIVER UPDATE LOCATION (REST fallback) ───
  updateDriverLocation: async (payload: {
    orderId: string;
    latitude: number;
    longitude: number;
    accuracy?: number;
    speed?: number;
    heading?: number;
    altitude?: number;
  }) => {
    const res = await api.post('/tracking/location', payload);
    return res.data;
  },
};
