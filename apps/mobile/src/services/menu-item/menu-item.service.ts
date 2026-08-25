import { CreateMenuItemPayload, MenuItem, MenuItemFilters, MenuItemsResponse, UpdateMenuItemPayload } from '@food_delivery/types';
import { api } from 'lib/axios';
import { Platform } from 'react-native';

export const menuItemService = {
  // ─── CREATE ───
  create: async (data: CreateMenuItemPayload): Promise<MenuItem> => {
    const formData = new FormData();
    
    // Append text fields
    Object.keys(data).forEach((key) => {
      if (key !== 'image' && data[key as keyof CreateMenuItemPayload] !== undefined) {
        formData.append(key, String(data[key as keyof CreateMenuItemPayload]));
      }
    });
    
    // Append image if exists
    if (data.image) {
      // For React Native, we need to handle the file object properly
      const image = data.image;
      if (Platform.OS === 'web') {
        formData.append('image', image);
      } else {
        // React Native: image is an object with uri, type, name
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || 'image.jpg',
        } as any);
      }
    }
    
    const response = await api.post('/menu-items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── GET ALL (By Restaurant) ───
  getByRestaurant: async (restaurantId: string, filters?: MenuItemFilters): Promise<MenuItemsResponse> => {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}`, {
      params: filters,
    });
    return response.data;
  },

  // ─── GET BY CATEGORY ───
  getByCategory: async (categoryId: string, isAvailable?: boolean): Promise<MenuItem[]> => {
    const response = await api.get(`/menu-items/category/${categoryId}`, {
      params: { isAvailable },
    });
    return response.data;
  },

  // ─── GET BY ID ───
  getById: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },

  // ─── UPDATE ───
  update: async (id: string, data: UpdateMenuItemPayload): Promise<MenuItem> => {
    const formData = new FormData();
    
    Object.keys(data).forEach((key) => {
      if (key !== 'image' && data[key as keyof UpdateMenuItemPayload] !== undefined) {
        formData.append(key, String(data[key as keyof UpdateMenuItemPayload]));
      }
    });
    
    if (data.image) {
      const image = data.image;
      if (Platform.OS === 'web') {
        formData.append('image', image);
      } else {
        formData.append('image', {
          uri: image.uri,
          type: image.type || 'image/jpeg',
          name: image.name || 'image.jpg',
        } as any);
      }
    }
    
    const response = await api.put(`/menu-items/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ─── TOGGLE AVAILABILITY ───
  toggleAvailability: async (id: string): Promise<{ isAvailable: boolean }> => {
    const response = await api.patch(`/menu-items/${id}/toggle-availability`);
    return response.data;
  },

  // ─── DELETE ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/menu-items/${id}`);
    return response.data;
  },

  // ─── BULK CREATE ───
  bulkCreate: async (items: CreateMenuItemPayload[]): Promise<MenuItem[]> => {
    const response = await api.post('/menu-items/bulk', items);
    return response.data;
  },

  // ─── BULK DELETE ───
  bulkDelete: async (ids: string[]): Promise<{ message: string; deleted: number }> => {
    const response = await api.delete('/menu-items/bulk', { data: { ids } });
    return response.data;
  },
};