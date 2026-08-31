import { DashboardData } from "@food_delivery/types";
import { api } from "@/lib/axios";


export const dashboardService = {
  // ─── GET DASHBOARD DATA ───
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data;
  },
};