import { DashboardData } from "@food_delivery/types";
import { api } from "@/lib/axios";


export const dashboardService = {
  // ─── GET DASHBOARD DATA ───
  // An optional location (from the customer's default saved address) enables the
  // distance-aware "Popular near you" discovery row and distance ordering.
  getDashboard: async (origin?: {
    lat: number;
    lng: number;
  }): Promise<DashboardData> => {
    const response = await api.get('/dashboard', {
      params: origin ? { lat: origin.lat, lng: origin.lng } : undefined,
    });
    return response.data;
  },
};