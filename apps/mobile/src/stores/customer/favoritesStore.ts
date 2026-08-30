import { Favorite } from '@food_delivery/types';
import { create } from 'zustand';

interface FavoritesState {
  // ─── State ───
  favorites: Favorite[];
  favoriteIds: Set<string>;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setFavorites: (favorites: Favorite[]) => void;
  addFavorite: (favorite: Favorite) => void;
  removeFavorite: (restaurantId: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  favorites: [],
  favoriteIds: new Set(),
  isLoading: false,
  error: null,

  setFavorites: (favorites) =>
    set({
      favorites,
      favoriteIds: new Set(favorites.map((f) => f.restaurantId)),
    }),

  addFavorite: (favorite) =>
    set((state) => ({
      favorites: [favorite, ...state.favorites],
      favoriteIds: new Set([...state.favoriteIds, favorite.restaurantId]),
    })),

  removeFavorite: (restaurantId) =>
    set((state) => ({
      favorites: state.favorites.filter((f) => f.restaurantId !== restaurantId),
      favoriteIds: new Set(
        [...state.favoriteIds].filter((id) => id !== restaurantId)
      ),
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      favorites: [],
      favoriteIds: new Set(),
      isLoading: false,
      error: null,
    }),
}));