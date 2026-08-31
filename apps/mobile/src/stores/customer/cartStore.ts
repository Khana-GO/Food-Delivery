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
  isLoading: boolean;

  setCart: (items: CartItem[], restaurantId: string | null) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => Promise<void>;
  removeItem: (menuItemId: string) => Promise<void>;
  updateQuantity: (menuItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
  syncGuestCart: (items: CartItem[], restaurantId: string) => Promise<void>;
}

function calc(items: CartItem[]) {
  return {
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    totalPrice: items.reduce((s, i) => s + i.price * i.quantity, 0),
  };
}

function toLocalItems(backendItems: any[]): CartItem[] {
  return (backendItems || []).map((i: any) => ({
    menuItemId: i.menuItemId,
    name: i.name,
    price: typeof i.unitPrice === 'number' ? i.unitPrice : parseFloat(i.unitPrice ?? i.price ?? 0),
    quantity: i.quantity,
    imageUrl: i.imageUrl,
    isAvailable: i.isAvailable ?? true,
    restaurantId: i.restaurantId ?? null,
    categoryId: i.categoryId,
  }));
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      totalItems: 0,
      totalPrice: 0,
      isSynced: false,
      isLoading: false,

      setCart: (items, restaurantId) => {
        const { totalItems, totalPrice } = calc(items);
        set({ items, restaurantId, totalItems, totalPrice });
      },

      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const backend = await cartService.getCart();
          if (!backend) {
            // No backend cart – keep local but mark unsynced if local has data
            set({ isSynced: get().items.length === 0 });
            return;
          }
          if (!backend.items || backend.items.length === 0) {
            // Backend empty, local may have data – will be pushed via syncWithBackend
            return;
          }
          const local = toLocalItems(backend.items);
          const { totalItems, totalPrice } = calc(local);
          set({ items: local, restaurantId: backend.restaurantId ?? null, totalItems, totalPrice, isSynced: true });
        } catch (e) {
          console.warn('[cart] fetchCart failed', e);
        } finally {
          set({ isLoading: false });
        }
      },

      addItem: async (item) => {
        const { items, restaurantId } = get();
        const prev = { items: [...items], restaurantId, ...calc(items) };

        // Different restaurant -> clear first (user confirmed by caller UI if needed)
        if (restaurantId && restaurantId !== item.restaurantId) {
          // Optimistically clear
          set({ items: [], restaurantId: null, totalItems: 0, totalPrice: 0 });
          try {
            await cartService.clearCart();
          } catch {}
        }

        // Optimistic local update
        const cur = get();
        let next = [...cur.items];
        const idx = next.findIndex((i) => i.menuItemId === item.menuItemId);
        if (idx >= 0) {
          const existing = next[idx];
          const newQty = Math.min(existing.quantity + 1, 10);
          next[idx] = { ...existing, quantity: newQty };
        } else {
          next.push({ ...item, quantity: 1 });
        }
        const { totalItems, totalPrice } = calc(next);
        set({ items: next, restaurantId: item.restaurantId ?? cur.restaurantId, totalItems, totalPrice });

        try {
          const backend = await cartService.addItem(item.menuItemId, 1);
          if (backend && backend.items) {
            const synced = toLocalItems(backend.items);
            const c = calc(synced);
            set({ items: synced, restaurantId: backend.restaurantId ?? item.restaurantId, ...c, isSynced: true });
          } else {
            set({ isSynced: true });
          }
        } catch (error: any) {
          console.warn('[cart] addItem backend failed', error?.message);
          // Rollback on 400 with message? Keep optimistic but mark unsynced
          // If error is "Restaurant not available" or closed, rollback
          const msg = error?.response?.data?.message || '';
          if (msg.includes('not available') || msg.includes('closed') || msg.includes('Max 10')) {
            // rollback
            set({ items: prev.items, restaurantId: prev.restaurantId, totalItems: prev.totalItems, totalPrice: prev.totalPrice });
            throw error; // let UI show Alert
          }
          set({ isSynced: false });
        }
      },

      updateQuantity: async (menuItemId, quantity) => {
        const { items } = get();
        const prev = [...items];
        const prevCalc = calc(prev);
        const q = Math.max(0, Math.min(10, Math.floor(quantity)));
        let next: CartItem[];
        if (q === 0) next = items.filter((i) => i.menuItemId !== menuItemId);
        else next = items.map((i) => (i.menuItemId === menuItemId ? { ...i, quantity: q } : i));
        const { totalItems, totalPrice } = calc(next);
        const nextRestaurantId = next.length === 0 ? null : get().restaurantId;
        set({ items: next, totalItems, totalPrice, restaurantId: nextRestaurantId });

        try {
          const backend = await cartService.updateItem(menuItemId, q);
          if (backend) {
            if (!backend.items || backend.items.length === 0) {
              set({ items: [], restaurantId: null, totalItems: 0, totalPrice: 0, isSynced: true });
            } else {
              const synced = toLocalItems(backend.items);
              const c = calc(synced);
              set({ items: synced, restaurantId: backend.restaurantId ?? nextRestaurantId, ...c, isSynced: true });
            }
          }
        } catch (e: any) {
          console.warn('[cart] updateQuantity failed', e?.message);
          // rollback on error if needed
          if (e?.response?.status === 404) {
            // item not found, keep optimistic
            set({ isSynced: false });
          }
        }
      },

      removeItem: async (menuItemId) => {
        const { items, restaurantId } = get();
        const prev = [...items];
        const next = items.filter((i) => i.menuItemId !== menuItemId);
        const { totalItems, totalPrice } = calc(next);
        set({ items: next, totalItems, totalPrice, restaurantId: next.length === 0 ? null : restaurantId });
        try {
          const backend = await cartService.removeItem(menuItemId);
          if (backend) {
            if (!backend.items || backend.items.length === 0) {
              set({ items: [], restaurantId: null, totalItems: 0, totalPrice: 0, isSynced: true });
            } else {
              const synced = toLocalItems(backend.items);
              const c = calc(synced);
              set({ items: synced, restaurantId: backend.restaurantId ?? (next.length === 0 ? null : restaurantId), ...c, isSynced: true });
            }
          }
        } catch (e) {
          console.warn('[cart] removeItem failed', e);
          // keep optimistic, mark unsynced
          set({ isSynced: false });
        }
      },

      clearCart: async () => {
        const prev = { items: get().items, restaurantId: get().restaurantId };
        set({ items: [], restaurantId: null, totalItems: 0, totalPrice: 0, isSynced: true });
        try {
          await cartService.clearCart();
        } catch (e) {
          console.warn('[cart] clearCart failed', e);
          // rollback if clear failed due to network? keep cleared locally but mark unsynced
          set({ isSynced: false });
        }
      },

      syncWithBackend: async () => {
        try {
          const backend = await cartService.getCart();
          if (backend && backend.items && backend.items.length > 0) {
            const synced = toLocalItems(backend.items);
            const { totalItems, totalPrice } = calc(synced);
            set({ items: synced, restaurantId: backend.restaurantId ?? null, totalItems, totalPrice, isSynced: true });
          } else {
            const local = get().items;
            const rid = get().restaurantId;
            if (local.length > 0 && rid) {
              const merged = await cartService.mergeCart(local, rid);
              if (merged && merged.items) {
                const synced = toLocalItems(merged.items);
                const c = calc(synced);
                set({ items: synced, restaurantId: merged.restaurantId ?? rid, ...c, isSynced: true });
              }
            } else {
              set({ isSynced: true });
            }
          }
        } catch (e) {
          console.warn('[cart] syncWithBackend failed', e);
        }
      },

      syncGuestCart: async (items, restaurantId) => {
        try {
          const result = await cartService.mergeCart(items, restaurantId);
          if (result && result.items) {
            const synced = toLocalItems(result.items);
            const { totalItems, totalPrice } = calc(synced);
            set({ items: synced, restaurantId: result.restaurantId ?? restaurantId, totalItems, totalPrice, isSynced: true });
          }
        } catch (e) {
          console.warn('[cart] syncGuestCart failed', e);
        }
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items, restaurantId: state.restaurantId, totalItems: state.totalItems, totalPrice: state.totalPrice }),
    }
  )
);
