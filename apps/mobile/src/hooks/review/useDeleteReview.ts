import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';
import { useReviewStore } from '@/stores/reviewStore';
import { Alert } from 'react-native';

export const useDeleteReview = () => {
  const queryClient = useQueryClient();
  const { removeReview, setLoading, setError } = useReviewStore();

  return useMutation({
    mutationFn: (id: string) => {
      setLoading(true);
      return reviewService.delete(id);
    },
    onSuccess: (_, id) => {
      removeReview(id);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      setLoading(false);
      Alert.alert('Success', 'Review deleted');
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to delete review';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};