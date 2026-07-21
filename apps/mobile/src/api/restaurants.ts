import axios from 'axios';
import { Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';

const API_URL = Platform.OS === 'web' 
  ? process.env.EXPO_PUBLIC_API_URL_WEB || 'http://localhost:3000/api'
  : process.env.EXPO_PUBLIC_API_URL_MOBILE || 'http://192.168.18.192:3000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const fetchRestaurants = async () => {
  const { data } = await api.get('/restaurant');
  return data;
};

export const fetchRestaurantById = async (id: string) => {
  const { data } = await api.get(`/restaurant/${id}`);
  return data;
};

export const fetchRestaurantMenu = async (id: string) => {
  const { data } = await api.get(`/menu/restaurant/${id}`);
  return data;
};

export const useRestaurants = () => {
  return useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });
};

export const useRestaurant = (id: string) => {
  return useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantById(id),
    enabled: !!id,
  });
};

export const useRestaurantMenu = (id: string) => {
  return useQuery({
    queryKey: ['restaurant-menu', id],
    queryFn: () => fetchRestaurantMenu(id),
    enabled: !!id,
  });
};
