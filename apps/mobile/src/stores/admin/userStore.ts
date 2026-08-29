import { User } from '@food_delivery/types';
import { create } from 'zustand';

interface UserState {
  // ─── State ───
  users: User[];
  currentUser: User | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setUsers: (payload: { data: User[]; total: number; page: number; limit: number; totalPages: number }) => void;
  setCurrentUser: (user: User | null) => void;
  addUser: (user: User) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  removeUser: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  users: [],
  currentUser: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,

  setUsers: ({ data, total, page, limit, totalPages }) =>
    set({ users: data, total, page, limit, totalPages }),

  setCurrentUser: (user) => set({ currentUser: user }),

  addUser: (user) =>
    set((state) => ({
      users: [user, ...state.users],
      total: state.total + 1,
    })),

  updateUser: (id, data) =>
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
      currentUser: state.currentUser?.id === id ? { ...state.currentUser, ...data } : state.currentUser,
    })),

  removeUser: (id) =>
    set((state) => ({
      users: state.users.filter((u) => u.id !== id),
      total: state.total - 1,
      currentUser: state.currentUser?.id === id ? null : state.currentUser,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      users: [],
      currentUser: null,
      total: 0,
      page: 1,
      limit: 10,
      totalPages: 0,
      isLoading: false,
      error: null,
    }),
}));