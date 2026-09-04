import { useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';
import { useReviewStore } from '@/stores/reviewStore';
import { Alert } from 'react-native';
import { router } from 'expo-router';

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  const { addReview, setLoading, setError } = useReviewStore();

  return useMutation({
    mutationFn: (data: any) => {
      setLoading(true);
      return reviewService.create(data);
    },
    onSuccess: (data) => {
      addReview(data);
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review-stats'] });
      setLoading(false);
      Alert.alert('Success', 'Review posted successfully');
      router.back();
    },
    onError: (error: any) => {
      setLoading(false);
      const msg = error?.response?.data?.message || 'Failed to post review';
      setError(msg);
      Alert.alert('Error', msg);
    },
  });
};