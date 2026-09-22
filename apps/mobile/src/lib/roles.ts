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
