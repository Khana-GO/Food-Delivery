import { DriverAnalytics, PlatformMetrics, RestaurantAnalytics } from '@food_delivery/types';
import { create } from 'zustand';

interface AdminAnalyticsState {
  // ─── State ───
  platformMetrics: PlatformMetrics | null;
  restaurantAnalytics: RestaurantAnalytics[];
  driverAnalytics: DriverAnalytics[];
  totalRestaurants: number;
  totalDrivers: number;
  restaurantPage: number;
  driverPage: number;
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setPlatformMetrics: (metrics: PlatformMetrics) => void;
  setRestaurantAnalytics: (data: { data: RestaurantAnalytics[]; total: number; page: number }) => void;
  setDriverAnalytics: (data: { data: DriverAnalytics[]; total: number; page: number }) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAdminAnalyticsStore = create<AdminAnalyticsState>((set) => ({
  platformMetrics: null,
  restaurantAnalytics: [],
  driverAnalytics: [],
  totalRestaurants: 0,
  totalDrivers: 0,
  restaurantPage: 1,
  driverPage: 1,
  isLoading: false,
  error: null,

  setPlatformMetrics: (metrics) => set({ platformMetrics: metrics }),
  setRestaurantAnalytics: ({ data, total, page }) =>
    set({
      restaurantAnalytics: data,
      totalRestaurants: total,
      restaurantPage: page,
    }),
  setDriverAnalytics: ({ data, total, page }) =>
    set({
      driverAnalytics: data,
      totalDrivers: total,
      driverPage: page,
    }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      platformMetrics: null,
      restaurantAnalytics: [],
      driverAnalytics: [],
      totalRestaurants: 0,
      totalDrivers: 0,
      restaurantPage: 1,
      driverPage: 1,
      isLoading: false,
      error: null,
    }),
}));