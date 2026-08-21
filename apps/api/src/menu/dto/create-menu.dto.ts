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
import { Type } from 'class-transformer';

export class CreateMenuItemDto {
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
  @IsBoolean()
  isAvailable?: boolean = true;
}
