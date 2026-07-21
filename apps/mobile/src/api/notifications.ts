import axios from 'axios';
import { Platform } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';

const API_URL = Platform.OS === 'web' 
  ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
  : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';

const createApi = () => {
  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  return api;
};

export const fetchNotifications = async () => {
  const api = createApi();
  const { data } = await api.get('/notifications');
  return data;
};

export const markNotificationAsRead = async (id: string) => {
  const api = createApi();
  const { data } = await api.patch(`/notifications/${id}/read`);
  return data;
};

export const deleteNotification = async (id: string) => {
  const api = createApi();
  const { data } = await api.delete(`/notifications/${id}`);
  return data;
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: fetchNotifications,
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
