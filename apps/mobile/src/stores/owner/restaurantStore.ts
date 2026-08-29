import { Restaurant } from '@food_delivery/types';
import { create } from 'zustand';

interface RestaurantState {
  // ─── State ───
  restaurants: Restaurant[];
  currentRestaurant: Restaurant | null;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setRestaurants: (restaurants: Restaurant[]) => void;
  setCurrentRestaurant: (restaurant: Restaurant | null) => void;
  addRestaurant: (restaurant: Restaurant) => void;
  updateRestaurant: (id: string, data: Partial<Restaurant>) => void;
  removeRestaurant: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export const useRestaurantStore = create<RestaurantState>((set, get) => ({
  // ─── Initial State ───
  restaurants: [],
  currentRestaurant: null,
  isLoading: false,
  error: null,

  // ─── Actions ───
  setRestaurants: (restaurants) => set({ restaurants }),
  
  setCurrentRestaurant: (restaurant) => set({ currentRestaurant: restaurant }),
  
  addRestaurant: (restaurant) =>
    set((state) => ({
      restaurants: [restaurant, ...state.restaurants],
    })),
  
  updateRestaurant: (id, data) =>
    set((state) => ({
      restaurants: state.restaurants.map((r) =>
        r.id === id ? { ...r, ...data } : r
      ),
      currentRestaurant:
        state.currentRestaurant?.id === id
          ? { ...state.currentRestaurant, ...data }
          : state.currentRestaurant,
    })),
  
  removeRestaurant: (id) =>
    set((state) => ({
      restaurants: state.restaurants.filter((r) => r.id !== id),
      currentRestaurant:
        state.currentRestaurant?.id === id ? null : state.currentRestaurant,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearStore: () =>
    set({
      restaurants: [],
      currentRestaurant: null,
      isLoading: false,
      error: null,
    }),
}));