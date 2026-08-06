// src/utils/roles.ts
import { UserRole } from '@food_delivery/types';

export function getHomeRoute(role: UserRole): string {
  switch (role) {
    case 'ADMIN':
      return '/(admin)';
    case 'CUSTOMER':
      return '/(customer)';
    case 'DRIVER':
      return '/(driver)';
    case 'RESTAURANT_OWNER':
      return '/(restaurant)';
    default:
      return '/(customer)'; // fallback
  }
}