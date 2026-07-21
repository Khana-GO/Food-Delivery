import axios from 'axios';
import { Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
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

export const fetchAdminDashboard = async () => {
  const api = createApi();
  const { data } = await api.get('/admin/dashboard');
  return data;
};

export const useAdminDashboard = () => {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: fetchAdminDashboard,
  });
};
