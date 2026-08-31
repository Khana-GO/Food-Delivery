import { AdminOrderStats, Order } from '@food_delivery/types';
import { create } from 'zustand';

interface AdminOrderState {
  // ─── State ───
  orders: Order[];
  currentOrder: Order | null;
  stats: AdminOrderStats | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setOrders: (payload: { data: Order[]; total: number; page: number; limit: number; totalPages: number }) => void;
  setCurrentOrder: (order: Order | null) => void;
  setStats: (stats: AdminOrderStats) => void;
  updateOrder: (id: string, data: Partial<Order>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAdminOrderStore = create<AdminOrderState>((set) => ({
  orders: [],
  currentOrder: null,
  stats: null,
  total: 0,
  page: 1,
  limit: 20,
  totalPages: 0,
  isLoading: false,
  error: null,

  setOrders: ({ data, total, page, limit, totalPages }) =>
    set({ orders: data, total, page, limit, totalPages }),
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setStats: (stats) => set({ stats }),
  updateOrder: (id, data) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, ...data } : o)),
      currentOrder: state.currentOrder?.id === id ? { ...state.currentOrder, ...data } : state.currentOrder,
    })),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      stats: null,
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
      isLoading: false,
      error: null,
    }),
}));