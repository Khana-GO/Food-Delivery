import { Restaurant } from '@food_delivery/types';
import { create } from 'zustand';

interface RestaurantState {
  // ─── State ───
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setRestaurants: (payload: {
    data: Restaurant[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }) => void;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  removeRestaurant: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set) => ({
  restaurants: [],
  currentRestaurant: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  setRestaurants: ({ data, total, page, limit, totalPages }) =>
    set({ restaurants: data, total, page, limit, totalPages }),

  setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),

  updateRestaurant: (id, data) =>
    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, ...data } : r,
      ),
      currentRestaurant:
        state.currentRestaurant?.id === id
          ? { ...state.currentRestaurant, ...data }
          : state.currentRestaurant,
    })),

  removeRestaurant: (id) =>
    set((state) => ({
      restaurants: state.restaurants.filter((r) => r.id !== id),
      total: state.total - 1,
      currentRestaurant:
        state.currentRestaurant?.id === id ? null : state.currentRestaurant,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      restaurants: [],
      currentRestaurant: null,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      isLoading: false,
      error: null,
    }),
}));