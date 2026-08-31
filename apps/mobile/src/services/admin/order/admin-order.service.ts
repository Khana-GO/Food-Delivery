import { api } from '@/lib/axios';
import { AdminOrderFilters, AdminOrderStats, Order } from '@food_delivery/types';

export const adminOrderService = {
  // ─── GET ALL ORDERS ───
  getAllOrders: async (filters?: AdminOrderFilters): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/orders/admin/all', { params: filters });
    return response.data;
  },

  // ─── GET ORDER STATS ───
  getStats: async (): Promise<AdminOrderStats> => {
    const response = await api.get('/orders/admin/stats');
    return response.data;
  },

  // ─── GET ORDER DETAILS ───
  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // ─── UPDATE ORDER STATUS ───
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await api.patch(`/orders/admin/${id}/status`, { status });
    return response.data;
  },
};