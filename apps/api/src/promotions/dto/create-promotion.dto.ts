import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  Min,
  Max,
  IsDate,
  IsBoolean,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  FLAT = 'FLAT',
}

export class CreatePromotionDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: '20% off on orders above Rs. 500' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: DiscountType, example: DiscountType.PERCENTAGE })
  @IsEnum(DiscountType)
  discountType!: DiscountType;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  discountValue!: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minOrderAmount?: number;

  @ApiPropertyOptional({ example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiProperty({ example: '2024-01-01T00:00:00Z' })
  @Type(() => Date)
  @IsDate()
  validFrom!: Date;

  @ApiProperty({ example: '2024-12-31T23:59:59Z' })
  @Type(() => Date)
  @IsDate()
  validUntil!: Date;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
