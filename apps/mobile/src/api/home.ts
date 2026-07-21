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

export interface HomeData {
  location: { latitude: number | null; longitude: number | null };
  banners: any[];
  categories: any[];
  recommendedFoods: any[];
  nearbyRestaurants: any[];
  popularFoods: any[];
  deals: any[];
  recentOrders: any[];
  topRatedRestaurants: any[];
  featuredRestaurants: any[];
}

export const fetchHomeData = async (lat?: number | null, lng?: number | null): Promise<HomeData> => {
  const params: any = {};
  if (lat) params.lat = lat;
  if (lng) params.lng = lng;
  
  const { data } = await api.get('/home', { params });
  return data;
};

export const useHomeData = (lat?: number | null, lng?: number | null) => {
  return useQuery({
    queryKey: ['home', lat, lng],
    queryFn: () => fetchHomeData(lat, lng),
  });
};
