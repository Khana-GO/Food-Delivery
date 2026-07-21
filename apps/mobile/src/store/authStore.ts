import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { persist, createJSONStorage } from 'zustand/middleware';
export type AuthRole = 'CUSTOMER' | 'DRIVER' | 'RESTAURANT_OWNER' | 'ADMIN' | null;

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: AuthRole;
  imageUrl?: string;
  isVerified: boolean;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: AuthRole | null;
  token: string | null;
  login: (user: AuthUser, token?: string) => void;
  logout: () => void;
  setToken: (token: string) => void;
  switchRole: (role: AuthRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null,
      token: null,
      login: (user, token) => set((state) => ({ 
        user, 
        role: user.role, 
        isAuthenticated: true,
        token: token ?? state.token
      })),
      logout: () => set({ user: null, role: null, isAuthenticated: false, token: null }),
      setToken: (token) => set({ token }),
      switchRole: (role) => set((state) => ({ role, user: state.user ? { ...state.user, role } : null })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
