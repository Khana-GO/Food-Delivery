import { Notification, NotificationResponse } from "@food_delivery/types";
import { api } from "lib/axios";

export const notificationService = {
  // ─── GET NOTIFICATIONS ───
  getMyNotifications: async (params?: {
    page?: number;
    limit?: number;
    isRead?: boolean;
    type?: string;
  }): Promise<NotificationResponse> => {
    const response = await api.get('/notifications', { params });
    return response.data;
  },

  // ─── GET UNREAD COUNT ───
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get('/notifications/unread-count');
    return response.data;
  },

  // ─── MARK AS READ ───
  markAsRead: async (id: string): Promise<Notification> => {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  // ─── MARK ALL AS READ ───
  markAllAsRead: async (): Promise<{ message: string; count: number }> => {
    const response = await api.patch('/notifications/read-all');
    return response.data;
  },

  // ─── DELETE NOTIFICATION ───
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },

  // ─── DELETE ALL ───
  deleteAll: async (): Promise<{ message: string; count: number }> => {
    const response = await api.delete('/notifications');
    return response.data;
  },
};