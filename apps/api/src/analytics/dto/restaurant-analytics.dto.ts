import { ApiProperty } from '@nestjs/swagger';

export class RestaurantAnalyticsDto {
  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  totalRevenue!: number;

  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  totalReviews!: number;

  @ApiProperty()
  growth!: number; // percentage change in orders

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: { date: { type: 'string' }, orders: { type: 'number' } },
      additionalProperties: false,
    },
  })
  dailyTrend!: { date: string; orders: number }[];
}

export class RestaurantAnalyticsListDto {
  @ApiProperty({ type: [RestaurantAnalyticsDto] })
  data!: RestaurantAnalyticsDto[];

  @ApiProperty()
  total!: number;

  @ApiProperty()
  page!: number;

  @ApiProperty()
  limit!: number;

  @ApiProperty()
  totalPages!: number;
}
