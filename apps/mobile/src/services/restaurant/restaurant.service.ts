import { CreateRestaurantPayload, Restaurant } from '@food_delivery/types';
import { api } from 'lib/axios';

export const restaurantService = {
  // ─── CREATE RESTAURANT ───
  create: async (data: CreateRestaurantPayload): Promise<Restaurant> => {
    const response = await api.post('/restaurants', data);
    return response.data;
  },

  // ─── UPLOAD IMAGES ───
  uploadImages: async (restaurantId: string, logo?: File, cover?: File): Promise<{ logoUrl?: string; coverImageUrl?: string }> => {
    const formData = new FormData();
    if (logo) {
      formData.append('logo', {
        uri: logo,
        type: logo.type,
        name: logo.name || 'logo.jpg',
      } as any);
    }
    if (cover) {
      formData.append('cover', {
        uri: cover,
        type: cover.type,
        name: cover.name || 'cover.jpg',
      } as any);
    }

    const response = await api.post(`/restaurants/${restaurantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── GET MY RESTAURANTS ───
  getMyRestaurants: async (): Promise<Restaurant[]> => {
    const response = await api.get('/restaurants/my');
    return response.data;
  },

  // ─── GET RESTAURANT BY ID ───
  getById: async (id: string): Promise<Restaurant> => {
    const response = await api.get(`/restaurants/${id}`);
    return response.data;
  },

  // ─── UPDATE RESTAURANT ───
  update: async (id: string, data: Partial<CreateRestaurantPayload>): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
  },

  // ─── GET ALL RESTAURANTS ───
  getAll: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    cuisineType?: string;
    isOpen?: boolean;
  }): Promise<{ restaurants: Restaurant[]; total: number }> => {
    const response = await api.get('/restaurants', { params });
    return response.data;
  },

  // ─── DELETE RESTAURANT ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },
};