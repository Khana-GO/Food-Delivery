import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { RestaurantResponseDto } from '../../restaurant/dto/restarurant-response.dto';
import { CategoryResponseDto } from '../../menu-categories/dto/category-response.dto';
import { ExploreSection } from '../../recommendation/recommendation.service';

export class DashboardResponseDto {
  @ApiProperty()
  user!: UserResponseDto;

  @ApiProperty({ type: [RestaurantResponseDto] })
  popularRestaurants!: RestaurantResponseDto[];

  @ApiProperty({ type: [RestaurantResponseDto] })
  recommendations!: RestaurantResponseDto[];

  @ApiProperty({ type: [RestaurantResponseDto] })
  recentlyOrdered!: RestaurantResponseDto[];

  @ApiProperty({ type: [CategoryResponseDto] })
  categories!: CategoryResponseDto[];

  @ApiProperty({ required: false })
  featuredMenuItems?: any[];

  /**
   * Dynamic Explore rows (Popular near you, Trending, Top rated, Fast delivery,
   * Cafes, Budget friendly, Recently added). Only rows with real data are
   * included — the array can legitimately be empty.
   */
  @ApiProperty({ required: false })
  sections?: ExploreSection[];
}
