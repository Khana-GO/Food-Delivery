import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string; // menu item id
  name: string;
  price: number;
  qty: number;
  restaurantId: string;
  restaurantName: string;
  emoji?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  addItem: (item: Omit<CartItem, 'qty'>) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, delta: number) => void;
  clearCart: () => void;
  getCartArray: () => CartItem[];
  getSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      addItem: (item) => set((state) => {
        const existing = state.items[item.id];
        return {
          items: {
            ...state.items,
            [item.id]: existing 
              ? { ...existing, qty: existing.qty + 1 }
              : { ...item, qty: 1 }
          }
        };
      }),
      removeItem: (id) => set((state) => {
        const newItems = { ...state.items };
        delete newItems[id];
        return { items: newItems };
      }),
      updateQty: (id, delta) => set((state) => {
        const item = state.items[id];
        if (!item) return state;
        const newQty = item.qty + delta;
        
        if (newQty <= 0) {
          const newItems = { ...state.items };
          delete newItems[id];
          return { items: newItems };
        }
        
        return {
          items: {
            ...state.items,
            [id]: { ...item, qty: newQty }
          }
        };
      }),
      clearCart: () => set({ items: {} }),
      getCartArray: () => Object.values(get().items),
      getSubtotal: () => {
        const items = Object.values(get().items);
        return items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      }
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
