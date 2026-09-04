import { useQuery } from '@tanstack/react-query';
import { reviewService } from '@/services/review/review.service';

export const useMyReviews = () => {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewService.getMyReviews(),
    staleTime: 60 * 1000,
  });
};
