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

export const fetchProfile = async () => {
  const api = createApi();
  const { data } = await api.get('/users/me');
  return data;
};

export const updateProfile = async (profileData: any) => {
  const api = createApi();
  const { data } = await api.patch('/users/me', profileData);
  return data;
};

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data) => {
      queryClient.setQueryData(['profile'], data);
    },
  });
};

export const fetchAllUsers = async () => {
  const api = createApi();
  const { data } = await api.get('/users');
  return data;
};

export const useAllUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: fetchAllUsers,
  });
};
