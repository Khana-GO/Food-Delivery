import { IsString, IsUUID, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ValidatePromotionDto {
  @ApiProperty({ example: 'SAVE20' })
  @IsString()
  code!: string;

  @ApiPropertyOptional({ example: 'restaurant-uuid' })
  @IsOptional()
  @IsUUID('4')
  restaurantId?: string;

  @ApiProperty({ example: 600 })
  @IsNumber()
  subtotal!: number;
}
