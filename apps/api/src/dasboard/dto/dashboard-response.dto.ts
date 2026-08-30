import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';
import { RestaurantResponseDto } from '../../restaurant/dto/restarurant-response.dto';
import { CategoryResponseDto } from '../../menu-categories/dto/category-response.dto';

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
}
