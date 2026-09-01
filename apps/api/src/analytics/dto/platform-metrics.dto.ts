import { ApiProperty } from '@nestjs/swagger';

export class PlatformMetricsDto {
  @ApiProperty()
  totalUsers!: number;

  @ApiProperty()
  totalRestaurants!: number;

  @ApiProperty()
  totalDrivers!: number;

  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  totalRevenue!: number;

  @ApiProperty()
  ordersToday!: number;

  @ApiProperty()
  revenueToday!: number;

  @ApiProperty()
  ordersThisWeek!: number;

  @ApiProperty()
  revenueThisWeek!: number;

  @ApiProperty()
  ordersThisMonth!: number;

  @ApiProperty()
  revenueThisMonth!: number;

  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        date: { type: 'string' },
        orders: { type: 'number' },
        revenue: { type: 'number' },
      },
      additionalProperties: false,
    },
  })
  orderTrend!: { date: string; orders: number; revenue: number }[];

  @ApiProperty()
  growth!: {
    orders: number; // percentage
    revenue: number;
    users: number;
    restaurants: number;
  };
}
