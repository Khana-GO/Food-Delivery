// contexts/AuthContext.tsx
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";

import { api } from "../../lib/axios";

import {
  saveAccessToken,
  saveRefreshToken,
  getAccessToken,
  deleteTokens,
} from "../../lib/secure-storage";

import { User, UserRole } from "@food_delivery/types";

// ===============================
// Types
// ===============================

interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
}

interface VerifyEmailData {
  email: string;
  code: string;
}

interface ForgotPasswordData {
  email: string;
}

interface ResetPasswordData {
  email: string;
  code: string;
  newPassword: string;
}


interface AuthContextType {
  user: User | null;
  isInitializing: boolean;
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  role: UserRole | null;
  login: (data: LoginData) => Promise<User>;
  register: (data: RegisterData) => Promise<{ email: string; message: string }>;
  verifyEmail: (data: VerifyEmailData) => Promise<void>;
  resendVerificationCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  forgotPassword: (data: ForgotPasswordData) => Promise<void>;
  resetPassword: (data: ResetPasswordData) => Promise<void>;
}

// ===============================
// Context
// ===============================

const AuthContext = createContext<AuthContextType | null>(null);

// ===============================
// Provider
// ===============================

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);


  // ===============================
// Implement methods in Provider
// ===============================

const forgotPassword = useCallback(async (data: ForgotPasswordData): Promise<void> => {
  setIsAuthenticating(true);
  try {
    await api.post('/auth/forgot-password', data);
  } catch (error) {
    throw error;
  } finally {
    if (isMountedRef.current) setIsAuthenticating(false);
  }
}, []);

const resetPassword = useCallback(async (data: ResetPasswordData): Promise<void> => {
  setIsAuthenticating(true);
  try {
    await api.post('/auth/reset-password', data);
  } catch (error) {
    throw error;
  } finally {
    if (isMountedRef.current) setIsAuthenticating(false);
  }
}, []);

  // ---------- Restore session on launch ----------
  const restoreSession = useCallback(async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        setIsInitializing(false);
        return;
      }

      const response = await api.get("/auth/me");
      if (isMountedRef.current) setUser(response.data.user);
    } catch {
      await deleteTokens();
      if (isMountedRef.current) setUser(null);
    } finally {
      if (isMountedRef.current) setIsInitializing(false);
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // ---------- Login ----------
  const login = useCallback(async (data: LoginData): Promise<User> => {
    setIsAuthenticating(true);
    try {
      const response = await api.post("/auth/login", data);
      const { accessToken, refreshToken, user: loggedInUser } = response.data;

      await Promise.all([
        saveAccessToken(accessToken),
        saveRefreshToken(refreshToken),
      ]);

      if (isMountedRef.current) setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      throw error;
    } finally {
      if (isMountedRef.current) setIsAuthenticating(false);
    }
  }, []);

  // ---------- Register (no auto-login) ----------
  const register = useCallback(async (data: RegisterData): Promise<{ email: string; message: string }> => {
    setIsAuthenticating(true);
    try {
      const response = await api.post("/auth/register", data);
      // The backend returns { message, email } – we don't save tokens or set user
      return response.data;
    } catch (error) {
      throw error;
    } finally {
      if (isMountedRef.current) setIsAuthenticating(false);
    }
  }, []);

  // ---------- Verify Email ----------
  const verifyEmail = useCallback(async (data: VerifyEmailData): Promise<void> => {
    setIsAuthenticating(true);
    try {
      await api.post("/auth/verify-email", data);
    } catch (error) {
      throw error;
    } finally {
      if (isMountedRef.current) setIsAuthenticating(false);
    }
  }, []);

  // ---------- Resend Verification Code ----------
  const resendVerificationCode = useCallback(async (email: string): Promise<void> => {
    setIsAuthenticating(true);
    try {
      await api.post("/auth/resend-verification-code", { email });
    } catch (error) {
      throw error;
    } finally {
      if (isMountedRef.current) setIsAuthenticating(false);
    }
  }, []);

  // ---------- Logout ----------
  const logout = useCallback(async () => {
    setIsAuthenticating(true);
    try {
      await api.post("/auth/logout");
    } catch (error) {
      console.warn("Logout API call failed, clearing local session anyway:", error);
    } finally {
      await deleteTokens();
      if (isMountedRef.current) {
        setUser(null);
        setIsAuthenticating(false);
      }
    }
  }, []);

  // ---------- Refresh current user ----------
  const refreshUser = useCallback(async () => {
    try {
      const response = await api.get("/auth/me");
      if (isMountedRef.current) setUser(response.data.user);
    } catch (error) {
      console.warn("Failed to refresh user:", error);
    }
  }, []);

  // ---------- Memoized context value ----------
  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isInitializing,
      isAuthenticating,
      isAuthenticated: !!user,
      role: user?.role ?? null,
      login,
      register,
      verifyEmail,
      resendVerificationCode,
      logout,
      refreshUser,
      forgotPassword,
      resetPassword,
    }),
    [user, isInitializing, isAuthenticating, login, register, verifyEmail, resendVerificationCode, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ===============================
// Custom Hook
// ===============================

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}