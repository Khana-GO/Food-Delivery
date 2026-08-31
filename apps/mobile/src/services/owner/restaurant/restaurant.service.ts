import { CreateRestaurantPayload, Restaurant } from '@food_delivery/types';
import { api } from '@/lib/axios';

/** A locally picked image (expo-image-picker asset subset) ready for upload. */
export interface UploadableImage {
  uri: string;
  mimeType?: string;
  fileName?: string;
}

export type RestaurantImageType = 'logo' | 'cover';

export const restaurantService = {
  // ─── CREATE RESTAURANT ───
  create: async (data: CreateRestaurantPayload): Promise<Restaurant> => {
    const response = await api.post('/restaurants', data);
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

  // ─── AVAILABLE CUISINE TYPES ───
  getCuisines: async (): Promise<string[]> => {
    const response = await api.get('/restaurants/cuisines');
    return response.data;
  },

  // ─── UPDATE TEXT DETAILS ───
  update: async (
    id: string,
    data: Partial<CreateRestaurantPayload>,
  ): Promise<Restaurant> => {
    const response = await api.put(`/restaurants/${id}`, data);
    return response.data;
  },

  // ─── UPDATE SINGLE IMAGE (logo | cover) ───
  // Replaces the existing image on the backend (old one is removed from CDN).
  updateImage: async (
    restaurantId: string,
    type: RestaurantImageType,
    image: UploadableImage,
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> => {
    const formData = new FormData();
    formData.append(type, {
      uri: image.uri,
      type: image.mimeType || 'image/jpeg',
      name: image.fileName || `${type}.jpg`,
    } as unknown as Blob);

    const response = await api.put(`/restaurants/${restaurantId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── DELETE LOGO ───
  deleteLogo: async (restaurantId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${restaurantId}/logo`);
    return response.data;
  },

  // ─── DELETE COVER ───
  deleteCover: async (restaurantId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${restaurantId}/cover`);
    return response.data;
  },

  // ─── TOGGLE OPEN / CLOSED ───
  toggleOpenStatus: async (
    restaurantId: string,
  ): Promise<{ isOpen: boolean }> => {
    const response = await api.patch(`/restaurants/${restaurantId}/toggle-open`);
    return response.data;
  },

  // ─── SOFT DELETE RESTAURANT ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/restaurants/${id}`);
    return response.data;
  },
};
