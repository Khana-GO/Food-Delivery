import { create } from 'zustand';
import { Category, DashboardData, ExploreSection, Restaurant, MenuItem } from '@food_delivery/types';

interface DashboardState {
  // ─── State ───
  user: DashboardData['user'] | null;
  popularRestaurants: Restaurant[];
  recommendations: Restaurant[];
  recentlyOrdered: Restaurant[];
  categories: Category[];
  featuredMenuItems: (MenuItem & { restaurantName?: string })[];
  /** Data-driven discovery rows (empty when the API has too little data). */
  sections: ExploreSection[];
  isLoading: boolean;
  error: string | null;

  // ─── Actions ───
  setDashboard: (data: DashboardData) => void;
  setPopularRestaurants: (restaurants: Restaurant[]) => void;
  setRecommendations: (restaurants: Restaurant[]) => void;
  setRecentlyOrdered: (restaurants: Restaurant[]) => void;
  setCategories: (categories: Category[]) => void;
  setFeaturedMenuItems: (items: (MenuItem & { restaurantName?: string })[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useDashboardStore = create<DashboardState>((set) => ({
  user: null,
  popularRestaurants: [],
  recommendations: [],
  recentlyOrdered: [],
  categories: [],
  featuredMenuItems: [],
  sections: [],
  isLoading: false,
  error: null,

  setDashboard: (data) =>
    set({
      user: data.user,
      popularRestaurants: data.popularRestaurants,
      recommendations: data.recommendations,
      recentlyOrdered: data.recentlyOrdered,
      categories: data.categories,
      featuredMenuItems: (data as any).featuredMenuItems || [],
      sections: (data as any).sections || [],
    }),

  setPopularRestaurants: (restaurants) => set({ popularRestaurants: restaurants }),
  setRecommendations: (restaurants) => set({ recommendations: restaurants }),
  setRecentlyOrdered: (restaurants) => set({ recentlyOrdered: restaurants }),
  setCategories: (categories) => set({ categories }),
  setFeaturedMenuItems: (items) => set({ featuredMenuItems: items }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      user: null,
      popularRestaurants: [],
      recommendations: [],
      recentlyOrdered: [],
      categories: [],
      featuredMenuItems: [],
      sections: [],
      isLoading: false,
      error: null,
    }),
}));