import { Favorite } from "@food_delivery/types";
import { api } from "lib/axios";


export const favoritesService = {
  // ─── GET FAVORITES ───
  getFavorites: async (): Promise<Favorite[]> => {
    const response = await api.get('/favorites');
    return response.data;
  },

  // ─── ADD TO FAVORITES ───
  addFavorite: async (restaurantId: string): Promise<Favorite> => {
    const response = await api.post('/favorites', { restaurantId });
    return response.data;
  },

  // ─── REMOVE FROM FAVORITES ───
  removeFavorite: async (restaurantId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/favorites/restaurant/${restaurantId}`);
    return response.data;
  },

  // ─── CHECK IF FAVORITE ───
  checkFavorite: async (restaurantId: string): Promise<boolean> => {
    const response = await api.get(`/favorites/check/${restaurantId}`);
    // backend: { isFavorite: boolean }
    return response.data?.isFavorite ?? !!response.data;
  },
};