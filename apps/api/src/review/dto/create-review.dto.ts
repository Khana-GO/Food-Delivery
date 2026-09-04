import { IsInt, IsString, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  restaurantId!: string;

  @ApiPropertyOptional({ example: 'item-uuid' })
  @IsOptional()
  @IsUUID('4')
  itemId?: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @ApiPropertyOptional({ example: 'Great food and service!' })
  @IsOptional()
  @IsString()
  comment?: string;
}
