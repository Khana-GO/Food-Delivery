import { UserRole } from '@food_delivery/types';

export const roleHomeMap: Record<UserRole, string> = {
  ADMIN: '/(admin)',
  CUSTOMER: '/(customer)',
  DRIVER: '/(driver)',
  RESTAURANT_OWNER: '/(restaurant-owner)',
};

export function getHomeRoute(role: UserRole): string {
  return roleHomeMap[role] || '/(customer)';
}

/** Route groups each role is allowed to open. */
export const roleGroupMap: Record<UserRole, string[]> = {
  ADMIN: ['(admin)'],
  CUSTOMER: ['(customer)'],
  DRIVER: ['(driver)'],
  RESTAURANT_OWNER: ['(restaurant-owner)'],
};

export function canAccessGroup(
  role: UserRole | null | undefined,
  group: string | undefined,
): boolean {
  if (!group) return true;
  if (group === '(auth)') return true;
  if (!role) return false;
  return roleGroupMap[role]?.includes(group) ?? false;
}

/** Routes that are reachable without a session. */
export function isPublicRoute(group: string | undefined): boolean {
  // undefined = the splash at `/`; `onboarding` and the auth group are public.
  return group === undefined || group === 'onboarding' || group === '(auth)';
}

/**
 * Decide whether the current location must be redirected, and where to.
 *
 * Pure function so the access-control rules can be reasoned about (and tested)
 * without a running React Native environment.
 *
 * @param segments expo-router `useSegments()` value, e.g. ['(customer)', 'orders']
 */
export function resolveRouteGuard(params: {
  segments: string[];
  isAuthenticated: boolean;
  role: UserRole | null | undefined;
  isInitializing: boolean;
}): string | null {
  const { segments, isAuthenticated, role, isInitializing } = params;

  // Never redirect while the session is still being restored, otherwise a
  // logged-in user gets bounced to login on every cold start.
  if (isInitializing) return null;

  const group = segments[0];

  if (!isAuthenticated || !role) {
    // Unauthenticated: everything except the splash/onboarding/auth screens
    // requires a session. This also kicks an expired session back to login.
    return isPublicRoute(group) ? null : '/(auth)/login';
  }

  // Authenticated: sitting on an auth screen (e.g. after session expiry) goes
  // to the role's home, and cross-role deep links are refused.
  if (group === '(auth)') return getHomeRoute(role);
  if (group && group !== 'onboarding' && !canAccessGroup(role, group)) {
    return getHomeRoute(role);
  }

  return null;
}
