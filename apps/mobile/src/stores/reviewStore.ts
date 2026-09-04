import { Review, ReviewStats } from '@food_delivery/types';
import { create } from 'zustand';

interface ReviewState {
  reviews: Review[];
  currentReview: Review | null;
  stats: ReviewStats | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  setReviews: (payload: { data: Review[]; total: number; page: number; limit: number; totalPages: number }) => void;
  setCurrentReview: (review: Review | null) => void;
  setStats: (stats: ReviewStats) => void;
  addReview: (review: Review) => void;
  updateReview: (id: string, data: Partial<Review>) => void;
  removeReview: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reviews: [],
  currentReview: null,
  stats: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  setReviews: ({ data, total, page, limit, totalPages }) =>
    set({ reviews: data, total, page, limit, totalPages }),
  setCurrentReview: (review) => set({ currentReview: review }),
  setStats: (stats) => set({ stats }),
  addReview: (review) =>
    set((state) => ({
      reviews: [review, ...state.reviews],
      total: state.total + 1,
    })),
  updateReview: (id, data) =>
    set((state) => ({
      reviews: state.reviews.map((r) => (r.id === id ? { ...r, ...data } : r)),
      currentReview: state.currentReview?.id === id ? { ...state.currentReview, ...data } : state.currentReview,
    })),
  removeReview: (id) =>
    set((state) => ({
      reviews: state.reviews.filter((r) => r.id !== id),
      total: state.total - 1,
      currentReview: state.currentReview?.id === id ? null : state.currentReview,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      reviews: [],
      currentReview: null,
      stats: null,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      isLoading: false,
      error: null,
    }),
}));