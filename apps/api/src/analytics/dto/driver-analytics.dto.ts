import { ApiProperty } from '@nestjs/swagger';

export class DriverAnalyticsDto {
  @ApiProperty()
  driverId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  totalDeliveries!: number;

  @ApiProperty()
  totalEarnings!: number;

  @ApiProperty()
  averageRating!: number;

  @ApiProperty()
  completedDeliveries!: number;

  @ApiProperty()
  cancelledDeliveries!: number;

  @ApiProperty()
  acceptanceRate!: number; // percentage

  @ApiProperty()
  onTimeRate!: number; // percentage

  @ApiProperty()
  growth!: number; // percentage change in earnings
}
