import { api } from '@/lib/axios';
import { CreateOrderPayload, Order } from '@food_delivery/types';

export const orderService = {
  // ─── GET ORDERS ───
  getOrders: async (params?: { status?: string; page?: number; limit?: number }): Promise<{ data: Order[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // ─── GET SINGLE ORDER ───
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // ─── CREATE ORDER ───
  create: async (data: CreateOrderPayload): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // ─── CANCEL ORDER ───
  cancel: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/orders/${id}/cancel`);
    return response.data;
  },

  // ─── VALIDATE CART ───
  validateCart: async (items: any[]): Promise<{ valid: boolean; items: any[] }> => {
    const response = await api.post('/orders/validate-cart', { items });
    return response.data;
  },

  // ─── UPDATE ORDER STATUS (owner/driver) ───
  updateStatus: async (id: string, data: { orderStatus: string }): Promise<Order> => {
    const response = await api.patch(`/orders/${id}/status`, data);
    return response.data;
  },

  // ─── ASSIGN DRIVER ───
  assignDriver: async (orderId: string, driverId: string): Promise<Order> => {
    const response = await api.patch(`/orders/${orderId}/assign-driver`, { driverId });
    return response.data;
  },
};