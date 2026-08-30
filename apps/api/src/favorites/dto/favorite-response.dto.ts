import { ApiProperty } from '@nestjs/swagger';
import { RestaurantResponseDto } from '../../restaurant/dto/restarurant-response.dto';

export class FavoriteResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ type: () => RestaurantResponseDto })
  restaurant?: RestaurantResponseDto;
}
