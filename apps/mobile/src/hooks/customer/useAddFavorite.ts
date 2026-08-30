import { favoritesService } from '@/services/customer/favorites.service';
import { useFavoritesStore } from '@/stores/customer/favoritesStore';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

export const useAddFavorite = () => {
  const queryClient = useQueryClient();
  const { addFavorite, setLoading, setError } = useFavoritesStore();

  return useMutation({
    mutationFn: (restaurantId: string) => {
      setLoading(true);
      return favoritesService.addFavorite(restaurantId);
    },
    onSuccess: (data) => {
      addFavorite(data);
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      // Also invalidate dashboard if needed
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setLoading(false);
    },
    onError: (error: any) => {
      setLoading(false);
      const message = error?.response?.data?.message || 'Failed to add favorite';
      setError(message);
      Alert.alert('Error', message);
    },
  });
};