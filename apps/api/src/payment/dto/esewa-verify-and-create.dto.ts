import {
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
  IsEnum,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateNested,
  ArrayMinSize,
  IsInt,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../../order/dto/create-order.dto';

export class VerifyAndCreateOrderItemDto {
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

  @ApiPropertyOptional({
    example: 299,
    description: 'Ignored – server uses DB price',
  })
  @IsOptional()
  @IsNumber()
  unitPrice?: number;
}

export class EsewaVerifyAndCreateDto {
  @ApiPropertyOptional({ example: 'base64-encoded-callback-data-from-esewa' })
  @IsOptional()
  @IsString()
  data?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsString()
  @IsNotEmpty()
  transactionUuid!: string;

  @ApiPropertyOptional({ example: '650.00' })
  @IsOptional()
  @IsString()
  totalAmount?: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsNotEmpty()
  restaurantId!: string;

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  @IsNotEmpty()
  addressId!: string;

  @ApiProperty({ type: [VerifyAndCreateOrderItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => VerifyAndCreateOrderItemDto)
  items!: VerifyAndCreateOrderItemDto[];

  @ApiPropertyOptional({ example: 'Please add extra chili' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @ApiPropertyOptional({
    example: 'WELCOME50',
    description: 'Promotion code to apply (validated server-side)',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  promoCode?: string;
}
