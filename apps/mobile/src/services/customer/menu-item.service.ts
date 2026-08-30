import { MenuItem } from '@food_delivery/types';
import { api } from 'lib/axios';

export interface GroupedMenuItem {
  categoryId: string;
  categoryName?: string;
  items: MenuItem[];
}

export const menuItemService = {
  // ─── GET GROUPED MENU ITEMS ───
  getGroupedByRestaurant: async (restaurantId: string): Promise<GroupedMenuItem[]> => {
    const response = await api.get(`/menu-items/restaurant/${restaurantId}/grouped`);
    return response.data;
  },

  // ─── GET MENU ITEMS BY CATEGORY ───
  getByCategory: async (categoryId: string, isAvailable?: boolean): Promise<MenuItem[]> => {
    const response = await api.get(`/menu-items/category/${categoryId}`, {
      params: { isAvailable },
    });
    return response.data;
  },

  // ─── GET SINGLE MENU ITEM ───
  getById: async (id: string): Promise<MenuItem> => {
    const response = await api.get(`/menu-items/${id}`);
    return response.data;
  },
};