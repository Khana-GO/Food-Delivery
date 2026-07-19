import React, { createContext, useContext, useState } from 'react';
import { UserRole } from '@food_delivery/types';

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

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  role: AuthRole;
  login: (user: AuthUser) => void;
  logout: () => void;
  switchRole: (role: AuthRole) => void; // Dev helper for demo
}

const AuthContext = createContext<AuthContextType | null>(null);

// Mock user data for demo
const MOCK_USERS: Record<NonNullable<AuthRole>, AuthUser> = {
  CUSTOMER: {
    id: '1',
    firstName: 'Anish',
    lastName: 'Shrestha',
    email: 'anish.shrestha@email.com',
    phone: '+977 9841 234 567',
    role: 'CUSTOMER',
    isVerified: true,
  },
  DRIVER: {
    id: '2',
    firstName: 'Rajesh',
    lastName: 'Tamang',
    email: 'rajesh.tamang@email.com',
    phone: '+977 9812 345 678',
    role: 'DRIVER',
    isVerified: true,
  },
  RESTAURANT_OWNER: {
    id: '3',
    firstName: 'Himalayan',
    lastName: 'Spice Kitchen',
    email: 'owner@himalayan.com',
    phone: '+977 9841 111 222',
    role: 'RESTAURANT_OWNER',
    isVerified: true,
  },
  ADMIN: {
    id: '4',
    firstName: 'Admin',
    lastName: 'Dashboard',
    email: 'admin@khanago.com',
    phone: '+977 9800 000 000',
    role: 'ADMIN',
    isVerified: true,
  },
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(MOCK_USERS.CUSTOMER);

  const login = (authUser: AuthUser) => setUser(authUser);

  const logout = () => setUser(null);

  const switchRole = (role: AuthRole) => {
    if (role && MOCK_USERS[role]) {
      setUser(MOCK_USERS[role]);
    } else {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role ?? null,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
