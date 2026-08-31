import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  IsArray,
  IsEnum,
  Min,
  Max,
  MaxLength,
  IsNotEmpty,
  ValidateNested,
  IsPositive,
  ArrayMinSize,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
}

export class OrderItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @IsPositive()
  @Min(1)
  @Max(100)
  quantity!: number;

  // unitPrice is NOT trusted from client – server uses DB price.
  // Kept optional for backward compat but ignored in service.
  @ApiPropertyOptional({
    example: 299.0,
    description: 'Ignored – server uses DB price',
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  unitPrice?: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsNotEmpty()
  restaurantId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsNotEmpty()
  addressId!: string;

  @ApiProperty({ type: [OrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];

  @ApiPropertyOptional({ example: 'Please add extra chili' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.OFFLINE })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.OFFLINE;

  @ApiPropertyOptional({ example: 'pay_123456789' })
  @IsOptional()
  @IsString()
  paymentId?: string;
}
