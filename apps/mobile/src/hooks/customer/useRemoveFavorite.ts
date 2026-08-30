import { favoritesService } from '@/services/customer/favorites.service';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useRemoveFavorite = () => {
  const queryClient = useQueryClient();
  const { removeFavorite, setLoading, setError } = useFavoritesStore();

  return useMutation({
    mutationFn: (restaurantId: string) => {
      setLoading(true);
      return favoritesService.removeFavorite(restaurantId);
    },
    onSuccess: (_, restaurantId) => {
      removeFavorite(restaurantId);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLoading(false);
    },
    onError: (error: any) => {
      setLoading(false);
      const message = error?.response?.data?.message || 'Failed to remove favorite';
      setError(message);
      Alert.alert('Error', message);
    },
  });
};