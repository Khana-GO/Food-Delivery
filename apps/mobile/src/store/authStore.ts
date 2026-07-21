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
  availableRoles?: AuthRole[];
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  activeRole: AuthRole | null;
  availableRoles: AuthRole[];
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
      activeRole: null,
      availableRoles: [],
      token: null,
      login: (user, token) => set((state) => ({ 
        user, 
        activeRole: user.role,
        availableRoles: user.availableRoles || [user.role],
        isAuthenticated: true,
        token: token ?? state.token
      })),
      logout: () => set({ user: null, activeRole: null, availableRoles: [], isAuthenticated: false, token: null }),
      setToken: (token) => set({ token }),
      switchRole: (role) => set((state) => ({ activeRole: role })),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
