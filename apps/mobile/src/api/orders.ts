import axios from 'axios';
import { Platform } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
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

export const createOrder = async (orderData: any) => {
  const api = createApi();
  const { data } = await api.post('/order', orderData);
  return data;
};

export const fetchOrders = async () => {
  const api = createApi();
  const { data } = await api.get('/order');
  return data;
};

export const useCreateOrder = () => {
  return useMutation({
    mutationFn: createOrder,
  });
};

export const useOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });
};
