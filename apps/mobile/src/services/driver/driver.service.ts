import { api } from '@/lib/axios';
import type { Order } from '@food_delivery/types';

export type DriverEarnings = { total: number; deliveries: number; today: number; week: number };

export const driverService = {
  // ─── GET AVAILABLE ORDERS ───
  getAvailableOrders: async (lat?: number, lng?: number, radius?: number): Promise<Order[]> => {
    const response = await api.get('/orders/available', {
      params: { latitude: lat, longitude: lng, radius },
    });
    return response.data;
  },

  // ─── GET DRIVER ACTIVE ORDER ───
  getActiveOrder: async (): Promise<Order | null> => {
    const response = await api.get('/orders/driver/active');
    return response.data;
  },

  // ─── GET DRIVER ORDER HISTORY ───
  getOrderHistory: async (limit?: number): Promise<Order[]> => {
    const response = await api.get('/orders/driver/history', {
      params: { limit },
    });
    return response.data;
  },

  // ─── GET DRIVER EARNINGS ───
  getEarnings: async (): Promise<DriverEarnings> => {
    const response = await api.get('/orders/driver/earnings');
    return response.data;
  },

  // ─── ACCEPT DELIVERY (driver self-assign) ───
  acceptDelivery: async (orderId: string, driverId?: string): Promise<Order> => {
    // If driverId not provided, backend will use authenticated user when role is DRIVER (see controller fallback)
    const body: any = {};
    if (driverId) body.driverId = driverId;
    const response = await api.patch(`/orders/${orderId}/assign-driver`, body);
    return response.data;
  },

  // ─── UPDATE DELIVERY STATUS ───
  updateDeliveryStatus: async (orderId: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/status`, {
      orderStatus: status,
    });
    return response.data;
  },

  // ─── UPDATE DRIVER LOCATION ───
  updateLocation: async (orderId: string, latitude: number, longitude: number): Promise<void> => {
    await api.post('/tracking/location', {
      orderId,
      latitude,
      longitude,
    });
  },

  // ─── GET DRIVER PROFILE ───
  getProfile: async (): Promise<any> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  // ─── UPDATE DRIVER PROFILE ───
  updateProfile: async (data: any): Promise<any> => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },
};