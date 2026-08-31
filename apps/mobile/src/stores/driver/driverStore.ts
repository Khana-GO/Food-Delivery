import { create } from 'zustand';
import type { Order } from '@food_delivery/types';

interface DriverState {
  // ─── State ───
  availableOrders: Order[];
  activeOrder: Order | null;
  orderHistory: Order[];
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setAvailableOrders: (orders: Order[]) => void;
  setActiveOrder: (order: Order | null) => void;
  setOrderHistory: (orders: Order[]) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  removeAvailableOrder: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
  availableOrders: [],
  activeOrder: null,
  orderHistory: [],
  isLoading: false,
  error: null,

  setAvailableOrders: (orders) => set({ availableOrders: orders }),
  setActiveOrder: (order) => set({ activeOrder: order }),
  setOrderHistory: (orders) => set({ orderHistory: orders }),
  updateOrder: (id, data) =>
    set((state) => ({
      availableOrders: state.availableOrders.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
      activeOrder:
        state.activeOrder?.id === id ? { ...state.activeOrder, ...data } : state.activeOrder,
      orderHistory: state.orderHistory.map((o) =>
        o.id === id ? { ...o, ...data } : o
      ),
    })),
  removeAvailableOrder: (id) =>
    set((state) => ({
      availableOrders: state.availableOrders.filter((o) => o.id !== id),
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      availableOrders: [],
      activeOrder: null,
      orderHistory: [],
      isLoading: false,
      error: null,
    }),
}));