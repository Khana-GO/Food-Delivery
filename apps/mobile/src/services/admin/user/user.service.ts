
import { User, UserListFilters, UserRole, UserStats } from '@food_delivery/types';
import { api } from 'lib/axios';

export const userAdminService = {
  // ─── Admin: Get all users ───
  getAll: async (filters?: UserListFilters): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/users', { params: filters });
    return response.data;
  },

  // ─── Admin: Get single user ───
  getOne: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  // ─── Admin: Create user ───
  create: async (data: Partial<User> & { password: string }): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },

  // ─── Admin: Update user ───
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  // ─── Admin: Change user role ───
  changeRole: async (userId: string, role: UserRole): Promise<User> => {
    const response = await api.patch('/users/role', { userId, role });
    return response.data;
  },

  // ─── Admin: Soft delete ───
  softDelete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  // ─── Admin: Restore ───
  restore: async (id: string): Promise<User> => {
    const response = await api.patch(`/users/${id}/restore`);
    return response.data;
  },

  // ─── Admin: Permanent delete ───
  permanentDelete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}/permanent`);
    return response.data;
  },

  // ─── Admin: Get deleted users (paginated) ───
  getDeleted: async (filters?: UserListFilters): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const response = await api.get('/users/deleted/all', { params: filters });
    // Handle both legacy array response and new paginated response
    if (Array.isArray(response.data)) {
      return { data: response.data, total: response.data.length, page: 1, limit: response.data.length, totalPages: 1 };
    }
    return response.data;
  },

  // ─── Admin: Get user stats ───
  getStats: async (): Promise<UserStats> => {
    const response = await api.get('/users/stats/overview');
    return response.data;
  },
};