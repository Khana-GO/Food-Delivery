import { CreateMenuItemPayload, MenuItem, MenuItemFilters, MenuItemsResponse, UpdateMenuItemPayload } from '@food_delivery/types';
import { api } from 'lib/axios';
import { Platform } from 'react-native';

export const menuItemService = {
  // ─── CREATE ───
  create: async (data: CreateMenuItemPayload): Promise<MenuItem> => {
    // If no image, we can send as JSON for simpler validation (but keep FormData for consistency)
    const isFormData = !!data.image;
    if (isFormData) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'image') return;
        const value = data[key as keyof CreateMenuItemPayload];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          formData.append(key, String(value));
        } else if (key === 'isAvailable' && value !== undefined) {
          // Always send isAvailable even if false
          formData.append(key, String(value));
        }
      });
      const image: any = data.image;
      if (Platform.OS === 'web') {
        formData.append('image', image);
      } else {
        // Expo ImagePicker: { uri, mimeType, fileName, type, name }
        const mimeType = image.mimeType || image.type || 'image/jpeg';
        const fileName = image.fileName || image.name || `menu_${Date.now()}.jpg`;
        formData.append('image', {
          uri: image.uri,
          type: mimeType,
          name: fileName,
        } as any);
      }
      // Let axios set Content-Type with boundary — do NOT force it
      const response = await api.post('/menu-items', formData, {
        headers: { 'Content-Type': undefined } as any,
        // Required for RN to correctly set multipart boundary
        transformRequest: (d) => d,
      });
      return response.data;
    } else {
      // No image — send as JSON (simpler, avoids multipart issues)
      const { image, ...rest } = data as any;
      // Strip empty strings for optional fields
      const clean: any = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') clean[k] = v;
        else if (k === 'isAvailable' && v !== undefined) clean[k] = v;
      });
      const response = await api.post('/menu-items', clean);
      return response.data;
    }
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
    const hasImage = !!data.image;
    if (hasImage) {
      const formData = new FormData();
      Object.keys(data).forEach((key) => {
        if (key === 'image') return;
        const value = (data as any)[key];
        if (value !== undefined && value !== null && String(value).trim() !== '') {
          formData.append(key, String(value));
        } else if (key === 'isAvailable' && value !== undefined) {
          formData.append(key, String(value));
        }
      });
      const image: any = data.image;
      if (Platform.OS === 'web') {
        formData.append('image', image);
      } else {
        const mimeType = (image as any).mimeType || image.type || 'image/jpeg';
        const fileName = (image as any).fileName || image.name || `menu_${Date.now()}.jpg`;
        formData.append('image', {
          uri: image.uri,
          type: mimeType,
          name: fileName,
        } as any);
      }
      const response = await api.put(`/menu-items/${id}`, formData, {
        headers: { 'Content-Type': undefined } as any,
        transformRequest: (d) => d,
      });
      return response.data;
    } else {
      const { image, ...rest } = data as any;
      const clean: any = {};
      Object.entries(rest).forEach(([k, v]) => {
        if (v !== undefined && v !== null && String(v).trim() !== '') clean[k] = v;
        else if (k === 'isAvailable' && v !== undefined) clean[k] = v;
      });
      const response = await api.put(`/menu-items/${id}`, clean);
      return response.data;
    }
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