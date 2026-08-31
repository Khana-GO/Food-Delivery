import { ApiProperty } from '@nestjs/swagger';

export class AdminOrderStatsDto {
  @ApiProperty()
  totalOrders!: number;

  @ApiProperty()
  totalRevenue!: number;

  @ApiProperty()
  pendingOrders!: number;

  @ApiProperty()
  confirmedOrders!: number;

  @ApiProperty()
  preparingOrders!: number;

  @ApiProperty()
  readyOrders!: number;

  @ApiProperty()
  pickedUpOrders!: number;

  @ApiProperty()
  deliveredOrders!: number;

  @ApiProperty()
  cancelledOrders!: number;

  @ApiProperty()
  todayOrders!: number;

  @ApiProperty()
  todayRevenue!: number;

  @ApiProperty()
  thisWeekOrders!: number;

  @ApiProperty()
  thisWeekRevenue!: number;

  @ApiProperty()
  thisMonthOrders!: number;

  @ApiProperty()
  thisMonthRevenue!: number;

  @ApiProperty({ type: Object, isArray: true })
  dailyTrend!: Record<string, any>[];

  @ApiProperty({ type: Object, isArray: true })
  revenueTrend!: Record<string, any>[];
}
