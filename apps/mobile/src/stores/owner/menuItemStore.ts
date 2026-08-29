import { MenuItem } from '@food_delivery/types';
import { create } from 'zustand';

interface MenuItemState {
  // ─── State ───
  items: MenuItem[];
  currentItem: MenuItem | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setItems: (response: { data: MenuItem[]; total: number; page: number; limit: number; totalPages: number }) => void;
  setCurrentItem: (item: MenuItem | null) => void;
  addItem: (item: MenuItem) => void;
  updateItem: (id: string, data: Partial<MenuItem>) => void;
  removeItem: (id: string) => void;
  toggleAvailability: (id: string) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearStore: () => void;
}

export const useMenuItemStore = create<MenuItemState>((set) => ({
  // ─── Initial State ───
  items: [],
  currentItem: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  // ─── Actions ───
  setItems: ({ data, total, page, limit, totalPages }) =>
    set({ items: data, total, page, limit, totalPages }),
  
  setCurrentItem: (item) => set({ currentItem: item }),
  
  addItem: (item) =>
    set((state) => ({
      items: [item, ...state.items],
      total: state.total + 1,
    })),
  
  updateItem: (id, data) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...data } : item
      ),
      currentItem:
        state.currentItem?.id === id
          ? { ...state.currentItem, ...data }
          : state.currentItem,
    })),
  
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      total: state.total - 1,
      currentItem:
        state.currentItem?.id === id ? null : state.currentItem,
    })),
  
  toggleAvailability: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      ),
      currentItem:
        state.currentItem?.id === id
          ? { ...state.currentItem, isAvailable: !state.currentItem.isAvailable }
          : state.currentItem,
    })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  clearStore: () =>
    set({
      items: [],
      currentItem: null,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      isLoading: false,
      error: null,
    }),
}));