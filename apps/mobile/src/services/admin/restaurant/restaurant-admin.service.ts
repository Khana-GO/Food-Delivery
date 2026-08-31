import { Restaurant, RestaurantFilters, RestaurantListResponse, RestaurantStats } from '@food_delivery/types';
import { api } from '@/lib/axios';

export const restaurantAdminService = {
  getAll: async (filters?: RestaurantFilters): Promise<RestaurantListResponse> => {
    const response = await api.get('/restaurants', { params: filters });
    return response.data;
  },

  getOne: async (id: string): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  update: async (id: string, data: Partial<Restaurant>): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
  },

  toggleVerification: async (id: string): Promise<{ isVerified: boolean }> => {
    const response = await api.patch(`/restaurants/${id}/toggle-verify`);
    return response.data;
  },

  toggleActive: async (id: string): Promise<{ isActive: boolean }> => {
    const response = await api.patch(`/restaurants/${id}/toggle-active`);
    return response.data;
  },

  toggleOpen: async (id: string): Promise<{ isOpen: boolean }> => {
    const response = await api.patch(`/restaurants/${id}/toggle-open`);
    return response.data;
  },

  softDelete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },

  restore: async (id: string): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}/restore`);
    return response.data;
  },

  permanentDelete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${id}/permanent`);
    return response.data;
  },

  getDeleted: async (filters?: RestaurantFilters): Promise<RestaurantListResponse> => {
    const response = await api.get('/restaurants/deleted/all', { params: filters });
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, page: 1, limit: response.data.length, totalPages: 1 };
    }
    return response.data;
  },

  getStats: async (): Promise<RestaurantStats> => {
    const response = await api.get('/restaurants/stats');
    return response.data;
  },

  getStatsOverview: async (): Promise<RestaurantStats> => {
    const response = await api.get('/restaurants/stats/overview');
    return response.data;
  },
};
