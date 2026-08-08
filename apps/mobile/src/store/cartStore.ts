import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CartItem {
  id: string; // menu item id
  cartKey: string; // unique key (id + customization hash)
  name: string;
  price: number;
  qty: number;
  restaurantId: string;
  restaurantName: string;
  emoji?: string;
  image?: string;
  customizations?: string[];
  specialInstructions?: string;
}

interface CartState {
  items: Record<string, CartItem>;
  promoCode: string | null;
  discountAmount: number;
  deliveryNotes: string;
  savedForLater: CartItem[];

  addItem: (item: Omit<CartItem, 'qty' | 'cartKey'>) => void;
  removeItem: (cartKey: string) => void;
  updateQty: (cartKey: string, delta: number) => void;
  clearCart: () => void;
  applyPromoCode: (code: string) => { success: boolean; message: string };
  removePromoCode: () => void;
  setDeliveryNotes: (notes: string) => void;
  saveItemForLater: (cartKey: string) => void;
  moveFromSavedToCart: (item: CartItem) => void;

  getCartArray: () => CartItem[];
  getSubtotal: () => number;
  getDeliveryFee: () => number;
  getTax: () => number;
  getTotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: {},
      promoCode: null,
      discountAmount: 0,
      deliveryNotes: '',
      savedForLater: [],

      addItem: (item) =>
        set((state) => {
          const cartKey = `${item.id}_${(item.customizations || []).sort().join('_')}`;
          const existing = state.items[cartKey];
          return {
            items: {
              ...state.items,
              [cartKey]: existing
                ? { ...existing, qty: existing.qty + 1 }
                : { ...item, cartKey, qty: 1 },
            },
          };
        }),

      removeItem: (cartKey) =>
        set((state) => {
          const newItems = { ...state.items };
          delete newItems[cartKey];
          return { items: newItems };
        }),

      updateQty: (cartKey, delta) =>
        set((state) => {
          const item = state.items[cartKey];
          if (!item) return state;
          const newQty = item.qty + delta;

          if (newQty <= 0) {
            const newItems = { ...state.items };
            delete newItems[cartKey];
            return { items: newItems };
          }

          return {
            items: {
              ...state.items,
              [cartKey]: { ...item, qty: newQty },
            },
          };
        }),

      clearCart: () =>
        set({
          items: {},
          promoCode: null,
          discountAmount: 0,
          deliveryNotes: '',
        }),

      applyPromoCode: (code) => {
        const cleanCode = code.trim().toUpperCase();
        if (cleanCode === 'SAVE20') {
          const subtotal = get().getSubtotal();
          const discount = subtotal * 0.2;
          set({ promoCode: cleanCode, discountAmount: discount });
          return { success: true, message: '20% discount applied!' };
        } else if (cleanCode === 'WELCOME10') {
          set({ promoCode: cleanCode, discountAmount: 5.0 });
          return { success: true, message: '$5.00 welcome discount applied!' };
        } else if (cleanCode === 'FREEDEL') {
          set({ promoCode: cleanCode, discountAmount: 2.99 });
          return { success: true, message: 'Free delivery applied!' };
        }
        return { success: false, message: 'Invalid promo code' };
      },

      removePromoCode: () => set({ promoCode: null, discountAmount: 0 }),

      setDeliveryNotes: (notes) => set({ deliveryNotes: notes }),

      saveItemForLater: (cartKey) =>
        set((state) => {
          const item = state.items[cartKey];
          if (!item) return state;
          const newItems = { ...state.items };
          delete newItems[cartKey];
          return {
            items: newItems,
            savedForLater: [...state.savedForLater, item],
          };
        }),

      moveFromSavedToCart: (item) =>
        set((state) => {
          return {
            savedForLater: state.savedForLater.filter((i) => i.cartKey !== item.cartKey),
            items: {
              ...state.items,
              [item.cartKey]: item,
            },
          };
        }),

      getCartArray: () => Object.values(get().items),

      getSubtotal: () => {
        const items = Object.values(get().items);
        return items.reduce((sum, item) => sum + item.price * item.qty, 0);
      },

      getDeliveryFee: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        if (get().promoCode === 'FREEDEL') return 0;
        return subtotal > 35 ? 0 : 2.99; // Free delivery over $35
      },

      getTax: () => {
        const subtotal = get().getSubtotal();
        return subtotal * 0.13;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        const delivery = get().getDeliveryFee();
        const tax = get().getTax();
        const discount = get().discountAmount;
        return Math.max(0, subtotal + delivery + tax - discount);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
