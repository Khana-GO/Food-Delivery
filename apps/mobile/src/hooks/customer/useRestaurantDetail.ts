import { useRestaurant } from '@/hooks/owner/restaurant/useRestaurants';
import { useRestaurantMenu } from './useRestaurantMenu';
import { useEffect } from 'react';

export const useRestaurantDetail = (restaurantId: string) => {
  const {
    data: restaurant,
    isLoading: isLoadingRestaurant,
    error: restaurantError,
  } = useRestaurant(restaurantId);

  const {
    data: menuData,
    isLoading: isLoadingMenu,
    error: menuError,
  } = useRestaurantMenu(restaurantId);

  // Combine loading states
  const isLoading = isLoadingRestaurant || isLoadingMenu;
  const error = restaurantError || menuError;

  // Flatten menu items for easy access if needed
  const allMenuItems = menuData?.flatMap(group => group.items) || [];

  return {
    restaurant,
    menuData, // grouped by category
    allMenuItems,
    isLoading,
    error,
  };
};