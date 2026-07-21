import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FavoritesState {
  favorites: string[]; // array of restaurant IDs
  addFavorite: (id: string) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
}

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
      removeFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.filter((favId) => favId !== id),
        })),
      isFavorite: (id) => get().favorites.includes(id),
      toggleFavorite: (id) => {
        const isFav = get().favorites.includes(id);
        if (isFav) {
          get().removeFavorite(id);
        } else {
          get().addFavorite(id);
        }
      },
    }),
    {
      name: 'favorites-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
