import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';
import { useReviewStore } from '@/stores/reviewStore';
import { Alert } from 'react-native';

export const useUpdateReview = () => {
  const queryClient = useQueryClient();
  const { updateReview, setLoading, setError } = useReviewStore();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => {
      setLoading(true);
      return reviewService.update(id, data);
    },
    onSuccess: (data) => {
      updateReview(data.id, data);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      setLoading(false);
      Alert.alert('Success', 'Review updated');
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to update review';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};