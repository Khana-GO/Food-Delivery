import { useEffect } from 'react';
import { useRouter, useSegments } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@food_delivery/types';

const roleHomeMap: Record<UserRole, string> = {
  ADMIN: '/(admin)',
  CUSTOMER: '/(customer)',
  DRIVER: '/(driver)',
  RESTAURANT_OWNER: '/(restaurant)',
};

export function useProtectedRoute(allowedRoles: UserRole[] = []) {
  const { user, isInitializing, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    // Wait until auth is restored
    if (isInitializing) return;

    const currentSegment = segments[0];
    const inAuthGroup = currentSegment === '(auth)' || currentSegment === 'auth';
    const inOnboarding = currentSegment === 'onboarding';
    const inProtectedGroup = currentSegment?.startsWith('(') && currentSegment !== '(auth)';

    // --- 1. Not authenticated → redirect to login (unless already on auth/onboarding) ---
    if (!isAuthenticated && !inAuthGroup && !inOnboarding) {
      router.replace('/(auth)/login');
      return;
    }

    // --- 2. Authenticated but on auth pages → redirect to their home ---
    if (isAuthenticated && inAuthGroup) {
      const homeRoute = roleHomeMap[user?.role || 'CUSTOMER'];
      router.replace(homeRoute);
      return;
    }

    // --- 3. Authenticated and in a protected group → check role ---
    if (isAuthenticated && inProtectedGroup && allowedRoles.length > 0) {
      const userRole = user?.role;
      if (userRole && !allowedRoles.includes(userRole)) {
        // Role not allowed → redirect to the user's own home
        const homeRoute = roleHomeMap[userRole];
        router.replace(homeRoute);
        return;
      }
    }

    // --- 4. Authenticated on onboarding → redirect to home (already seen) ---
    if (isAuthenticated && inOnboarding) {
      const homeRoute = roleHomeMap[user?.role || 'CUSTOMER'];
      router.replace(homeRoute);
      return;
    }
  }, [isInitializing, isAuthenticated, user, segments, router, allowedRoles]);
}