import {
  IsUUID,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EsewaInitDto {
  // orderId is required for legacy flow (order already exists).
  // For the pre-payment flow, use transactionUuid instead.
  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID('4')
  orderId?: string;

  @ApiProperty({ example: 650 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'KhanaGo Order' })
  @IsOptional()
  @IsString()
  productName?: string;

  // Pre-payment flow: pass a unique transaction UUID instead of orderId
  @ApiPropertyOptional({ example: 'pay-1726000000000-abc1234' })
  @IsOptional()
  @IsString()
  transactionUuid?: string;
}
