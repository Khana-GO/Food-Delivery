import { Category, CreateCategoryPayload, UpdateCategoryPayload } from "@food_delivery/types";
import { api } from "@/lib/axios";


export const categoryService = {
  // ─── CREATE CATEGORY ───
  create: async (data: CreateCategoryPayload): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // ─── GET MY CATEGORIES (restaurant resolved from JWT) ───
  getMine: async (includeItemCount?: boolean): Promise<Category[]> => {
    const response = await api.get('/categories/my', {
      params: { includeItemCount },
    });
    return response.data;
  },

  // ─── GET ALL OWNER CATEGORIES (across all owned restaurants) ───
  getAllForOwner: async (includeItemCount?: boolean): Promise<Category[]> => {
    const response = await api.get('/categories/my/all', {
      params: { includeItemCount },
    });
    return response.data;
  },

  // ─── GET ALL CATEGORIES (By Restaurant) ───
  getByRestaurant: async (restaurantId: string, includeItemCount?: boolean): Promise<Category[]> => {
    const response = await api.get(`/categories/restaurant/${restaurantId}`, {
      params: { includeItemCount },
    });
    return response.data;
  },

  // ─── GET SINGLE CATEGORY ───
  getById: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // ─── UPDATE CATEGORY ───
  update: async (id: string, data: UpdateCategoryPayload): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // ─── DELETE CATEGORY ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};