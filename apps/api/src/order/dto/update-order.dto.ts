import {
  IsOptional,
  IsEnum,
  IsString,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  PICKED_UP = 'PICKED_UP',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export class UpdateOrderDto {
  @ApiPropertyOptional({ enum: OrderStatus })
  @IsOptional()
  @IsEnum(OrderStatus)
  orderStatus?: OrderStatus;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID('4')
  driverId?: string;

  @ApiPropertyOptional({ enum: PaymentStatus })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({ example: 'pay_123456789' })
  @IsOptional()
  @IsString()
  paymentId?: string;

  @ApiPropertyOptional({
    example: 45,
    description: 'Estimated minutes (5-120). Stored as integer + timestamp',
  })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(120)
  estimatedDeliveryTime?: number;

  @ApiPropertyOptional({ example: 'Customer changed address' })
  @IsOptional()
  @IsString()
  notes?: string;
}
