import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { cartService } from '@/stores/customer/cart.service';

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isAvailable?: boolean;
  restaurantId?: string | null;
}

interface CartState {
  items: CartItem[];
  restaurantId: string | null;
  totalItems: number;
  totalPrice: number;
  isSynced: boolean;

  // Local actions
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (items: CartItem[], restaurantId: string | null) => void;
  syncWithBackend: () => Promise<void>;
  syncGuestCart: (items: CartItem[], restaurantId: string) => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      totalItems: 0,
      totalPrice: 0,
      isSynced: false,

      setCart: (items, restaurantId) => {
        const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items, restaurantId, totalItems, totalPrice });
      },

      // ─── Add item (local + backend sync) ───
      addItem: async (item) => {
        const { items, restaurantId } = get();

        // If different restaurant, clear cart first
        if (restaurantId && restaurantId !== item.restaurantId) {
          await get().clearCart();
        }

        // Update local state
        let newItems = [...items];
        const existing = newItems.find(i => i.menuItemId === item.menuItemId);
        if (existing) {
          existing.quantity += 1;
        } else {
          newItems.push({ ...item, quantity: 1 });
        }

        const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items: newItems, restaurantId: item.restaurantId || null, totalItems, totalPrice });

        // ─── Sync with backend (if logged in) ───
        // Check if user is authenticated – we'll assume a global auth state or we can import useAuth
        // We'll use a global hook later; for now we'll call the API and catch errors.
        try {
          await cartService.addItem(item.menuItemId, 1);
          set({ isSynced: true });
        } catch (error) {
          console.warn('Backend sync failed (addItem)', error);
          // Keep local state; we can retry later
        }
      },

      // ─── Update quantity ───
      updateQuantity: async (menuItemId, quantity) => {
        const { items } = get();
        let newItems = items.map(i =>
          i.menuItemId === menuItemId ? { ...i, quantity } : i
        );
        if (quantity === 0) {
          newItems = newItems.filter(i => i.menuItemId !== menuItemId);
        }
        const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items: newItems, totalItems, totalPrice });

        try {
          await cartService.updateItem(menuItemId, quantity);
        } catch (error) {
          console.warn('Backend sync failed (updateQuantity)', error);
        }
      },

      // ─── Remove item ───
      removeItem: async (menuItemId) => {
        const { items } = get();
        const newItems = items.filter(i => i.menuItemId !== menuItemId);
        const totalItems = newItems.reduce((sum, i) => sum + i.quantity, 0);
        const totalPrice = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
        set({ items: newItems, totalItems, totalPrice, restaurantId: newItems.length === 0 ? null : get().restaurantId });

        try {
          await cartService.removeItem(menuItemId);
        } catch (error) {
          console.warn('Backend sync failed (removeItem)', error);
        }
      },

      // ─── Clear cart ───
      clearCart: async () => {
        set({ items: [], restaurantId: null, totalItems: 0, totalPrice: 0 });
        try {
          await cartService.clearCart();
        } catch (error) {
          console.warn('Backend sync failed (clearCart)', error);
        }
      },

      // ─── Sync local cart with backend (on login) ───
      syncWithBackend: async () => {
        try {
          const backendCart = await cartService.getCart();
          if (backendCart && backendCart.items.length > 0) {
            // Replace local with backend (backend wins)
            const items = backendCart.items.map((i: any) => ({
              menuItemId: i.menuItemId,
              name: i.name,
              price: i.unitPrice,
              quantity: i.quantity,
              imageUrl: i.imageUrl,
              isAvailable: i.isAvailable,
            }));
            set({ items, restaurantId: backendCart.restaurantId, isSynced: true });
          } else {
            // If local has items and backend is empty, push local to backend
            const localItems = get().items;
            const rid = get().restaurantId;
            if (localItems.length > 0 && rid) {
              await cartService.mergeCart(localItems, rid);
              set({ isSynced: true });
            }
          }
        } catch (error) {
          console.warn('Sync with backend failed', error);
        }
      },

      // ─── Sync guest cart after login ───
      syncGuestCart: async (items, restaurantId) => {
        try {
          const result = await cartService.mergeCart(items, restaurantId);
          // Update local with merged result
          const mergedItems = result.items.map((i: any) => ({
            menuItemId: i.menuItemId,
            name: i.name,
            price: i.unitPrice,
            quantity: i.quantity,
            imageUrl: i.imageUrl,
            isAvailable: i.isAvailable,
          }));
          set({ items: mergedItems, restaurantId: result.restaurantId, isSynced: true });
        } catch (error) {
          console.warn('Guest cart sync failed', error);
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);