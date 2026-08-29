import { IsOptional, IsString, IsEnum, IsBooleanString, IsInt, Min, Max, IsIn } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CuisineType } from './create-restaurant.dto';

export class FindRestaurantsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'Search by name, description, address' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CuisineType })
  @IsOptional()
  @IsEnum(CuisineType)
  cuisineType?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBooleanString()
  isOpen?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBooleanString()
  isVerified?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsString()
  sortBy?: string;

  @ApiPropertyOptional({ example: 'DESC', enum: ['ASC', 'DESC'] })
  @IsOptional()
  @IsIn(['ASC', 'DESC', 'asc', 'desc'])
  sortOrder?: 'ASC' | 'DESC' | 'asc' | 'desc';
}
