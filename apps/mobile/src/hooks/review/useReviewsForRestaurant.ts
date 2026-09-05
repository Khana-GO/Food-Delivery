import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';
import { useReviewStore } from '@/stores/reviewStore';

export const useReviewsForRestaurant = (restaurantId: string, page: number = 1, limit: number = 10) => {
  const { setReviews, setLoading, setError } = useReviewStore();

  return useQuery({
    queryKey: ['reviews', restaurantId, page, limit],
    queryFn: async () => {
      setLoading(true);
      try {
        const data = await reviewService.getReviewsForRestaurant(restaurantId, { page, limit });
        setReviews(data);
        return data;
      } catch (error: any) {
        setError(error?.response?.data?.message || 'Failed to load reviews');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    enabled: Boolean(restaurantId),
    staleTime: 5 * 60 * 1000,
  });
};
