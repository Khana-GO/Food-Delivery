import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DriverLocationResponseDto {
  @ApiProperty({ example: 27.7172 })
  latitude!: number;

  @ApiProperty({ example: 85.324 })
  longitude!: number;

  @ApiProperty({ example: '2024-01-01T10:00:00.000Z' })
  lastUpdatedAt!: Date;

  @ApiProperty({ example: true })
  isOnline!: boolean;

  @ApiPropertyOptional({ example: 8.5, description: 'Speed m/s' })
  speed?: number;

  @ApiPropertyOptional({ example: 45, description: 'Heading 0-360' })
  heading?: number;

  @ApiPropertyOptional({ example: 12, description: 'Accuracy meters' })
  accuracy?: number;

  @ApiPropertyOptional({ example: 1350 })
  altitude?: number;
}

export class RouteResponseDto {
  @ApiProperty({ example: 2450, description: 'Distance in meters' })
  distance!: number;

  @ApiProperty({ example: 600, description: 'Duration in seconds' })
  duration!: number;

  @ApiProperty({
    type: [Array],
    isArray: true,
    description: 'Polyline [[lat,lng],...]',
  })
  geometry!: number[][];

  @ApiPropertyOptional({ example: 'ok' })
  status?: string;
}

export class OrderTrackingSnapshotDto {
  @ApiProperty()
  orderId!: string;

  @ApiProperty({ type: DriverLocationResponseDto, nullable: true })
  driver!: DriverLocationResponseDto | null;

  @ApiProperty({ type: RouteResponseDto, nullable: true })
  route!: RouteResponseDto | null;

  @ApiProperty()
  restaurant!: { lat: number; lng: number; name?: string; address?: string };

  @ApiProperty()
  delivery!: { lat: number; lng: number; address?: string };

  @ApiProperty({ example: 'PICKED_UP' })
  orderStatus!: string;

  @ApiPropertyOptional({ nullable: true })
  estimatedDeliveryTime!: string | null;

  @ApiPropertyOptional({ nullable: true })
  estimatedDistance!: number | null;

  @ApiPropertyOptional({ nullable: true })
  estimatedDuration!: number | null;

  @ApiPropertyOptional({ type: [Object] })
  history?: Array<{ lat: number; lng: number; recordedAt: string }>;
}
