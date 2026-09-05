import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';

export const useReviewStats = (restaurantId: string) => {
  return useQuery({
    queryKey: ['review-stats', restaurantId],
    queryFn: () => reviewService.getReviewStats(restaurantId),
    enabled: Boolean(restaurantId),
    staleTime: 5 * 60 * 1000,
  });
};
