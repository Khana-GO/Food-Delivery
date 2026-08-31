import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiPropertyOptional({
    description:
      'Target restaurant. Required when the owner has multiple restaurants; must be owned by the requester.',
    example: 'restaurant-uuid',
  })
  @IsOptional()
  @IsUUID('4')
  restaurantId?: string;

  @ApiProperty({ example: 'Appetizers', maxLength: 100 })
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty({ message: 'Category name is required' })
  @MaxLength(100)
  name!: string;
}
