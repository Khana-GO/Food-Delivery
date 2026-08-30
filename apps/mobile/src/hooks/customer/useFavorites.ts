import { favoritesService } from '@/services/customer/favorites.service';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useQuery } from '@tanstack/react-query';

export const useFavorites = () => {
  const { setFavorites, setLoading, setError } = useFavoritesStore();

  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await favoritesService.getFavorites();
        setFavorites(data);
        return data;
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to load favorites';
        setError(message);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};