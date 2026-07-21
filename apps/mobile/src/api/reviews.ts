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

export const fetchRestaurantReviews = async (restaurantId: string) => {
  const api = createApi();
  const { data } = await api.get(`/reviews/restaurant/${restaurantId}`);
  return data;
};

export const createReview = async (reviewData: any) => {
  const api = createApi();
  const { data } = await api.post('/reviews', reviewData);
  return data;
};

export const useRestaurantReviews = (restaurantId: string) => {
  return useQuery({
    queryKey: ['reviews', restaurantId],
    queryFn: () => fetchRestaurantReviews(restaurantId),
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createReview,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.restaurantId] });
    },
  });
};
