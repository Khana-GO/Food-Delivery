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

export const fetchAddresses = async () => {
  const api = createApi();
  const { data } = await api.get('/address');
  return data;
};

export const createAddress = async (addressData: any) => {
  const api = createApi();
  const { data } = await api.post('/address', addressData);
  return data;
};

export const updateAddress = async ({ id, ...addressData }: any) => {
  const api = createApi();
  const { data } = await api.patch(`/address/${id}`, addressData);
  return data;
};

export const deleteAddress = async (id: string) => {
  const api = createApi();
  const { data } = await api.delete(`/address/${id}`);
  return data;
};

export const useAddresses = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: fetchAddresses,
  });
};

export const useCreateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useUpdateAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};

export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });
};
