import {
  IsString,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

/**
 * multipart/form-data delivers every field as a string, so "true"/"false"
 * must be converted explicitly. A plain Boolean("false") === true trap
 * is avoided here.
 */
export const ToBoolean = () =>
  Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  });

export class CreateMenuItemDto {
  @ApiPropertyOptional({
    description:
      'Target restaurant. Required when the owner has multiple restaurants; must be owned by the requester.',
    example: 'restaurant-uuid',
  })
  @IsOptional()
  @IsUUID('4')
  restaurantId?: string;

  @ApiProperty({ example: 'Chicken Momo' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiPropertyOptional({ example: 'Steamed chicken dumplings' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 299.0 })
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @ApiProperty({ example: 'category-uuid-here' })
  @IsUUID('4')
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({ example: 'https://example.com/momo.jpg' })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  isAvailable?: boolean = true;
}
