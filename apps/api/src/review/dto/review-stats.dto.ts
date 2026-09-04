import { ApiProperty } from '@nestjs/swagger';
import { ReviewResponseDto } from './review-response.dto';

export class ReviewStatsDto {
  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  totalReviews!: number;

  @ApiProperty()
  ratingDistribution:
    | {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
      }
    | undefined;

  @ApiProperty({ type: [ReviewResponseDto] })
  recentReviews: ReviewResponseDto[] | undefined;
}
