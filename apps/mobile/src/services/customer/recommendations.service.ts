import { Restaurant } from '@food_delivery/types';
import { api } from 'lib/axios';

export const recommendationsService = {
  // ─── POPULAR RESTAURANTS ───
  getPopularRestaurants: async (limit: number = 10): Promise<Restaurant[]> => {
    const response = await api.get('/recommendations/popular', {
      params: { limit },
    });
    return response.data;
  },

  // ─── PERSONALIZED RECOMMENDATIONS ───
  getPersonalizedRecommendations: async (limit: number = 10): Promise<Restaurant[]> => {
    const response = await api.get('/recommendations/personalized', {
      params: { limit },
    });
    return response.data;
  },

  // ─── RECENTLY ORDERED ───
  getRecentlyOrdered: async (limit: number = 5): Promise<Restaurant[]> => {
    const response = await api.get('/recommendations/recently-ordered', {
      params: { limit },
    });
    return response.data;
  },
};