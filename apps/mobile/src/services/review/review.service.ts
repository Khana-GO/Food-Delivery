import { api } from '@/lib/axios';
import { CreateReviewPayload, Review, ReviewStats, UpdateReviewPayload } from '@food_delivery/types';

export const reviewService = {
  // ─── CREATE REVIEW ───
  create: async (data: CreateReviewPayload): Promise<Review> => {
    const response = await api.post('/reviews', data);
    return response.data;
  },

  // ─── GET REVIEWS FOR RESTAURANT ───
  getReviewsForRestaurant: async (
    restaurantId: string,
    params?: { page?: number; limit?: number; sortOrder?: 'ASC' | 'DESC' },
  ): Promise<{ data: Review[]; total: number; page: number; limit: number; totalPages: number }> => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}`, { params });
    return response.data;
  },

  // ─── GET REVIEW STATS ───
  getReviewStats: async (restaurantId: string): Promise<ReviewStats> => {
    const response = await api.get(`/reviews/restaurant/${restaurantId}/stats`);
    return response.data;
  },

  // ─── GET MY REVIEWS (CUSTOMER) ───
  getMyReviews: async (): Promise<{ data: Review[]; averageRating: number; totalReviews: number }> => {
    const response = await api.get('/reviews/my');
    return response.data;
  },

  // ─── UPDATE REVIEW ───
  update: async (id: string, data: UpdateReviewPayload): Promise<Review> => {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  },

  // ─── DELETE REVIEW ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  },

  // ─── ADMIN: GET ALL REVIEWS ───
  adminGetAll: async (params?: { page?: number; limit?: number }): Promise<any> => {
    const response = await api.get('/reviews/admin/all', { params });
    return response.data;
  },
};