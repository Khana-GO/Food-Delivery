import {
  IsString,
  IsEmail,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsUUID,
  Min,
  Max,
  MinLength,
  MaxLength,
  IsEnum,
  IsLatitude,
  IsLongitude,
  Matches,
  IsNotEmpty,
  IsIn,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum CuisineType {
  NEPALI = 'Nepali',
  NEWARI = 'Newari',
  THAKALI = 'Thakali',
  INDIAN = 'Indian',
  CHINESE = 'Chinese',
  TIBETAN = 'Tibetan',
  ITALIAN = 'Italian',
  FAST_FOOD = 'Fast Food',
  CONTINENTAL = 'Continental',
  STREET_FOOD = 'Street Food',
  BAKERIES = 'Bakeries',
  DESSERTS = 'Desserts',
  DRINKS = 'Drinks',
}

export const WARD_NUMBERS = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
];

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Himalayan Spice Kitchen' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  name!: string;

  @ApiProperty({ example: 'himalayan-spice-kitchen' })
  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(255)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @ApiPropertyOptional({ example: 'Authentic Nepali cuisine' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/logo.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  logoUrl?: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  coverImageUrl?: string;

  @ApiPropertyOptional({ example: '9812345678' })
  @IsOptional()
  @IsString()
  @Matches(/^[9][8|6|7][0-9]{8}$/)
  phone?: string;

  @ApiPropertyOptional({ example: 'info@restaurant.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'Bhagwati Marg, Ward 3, Kathmandu' })
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  address!: string;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsIn(WARD_NUMBERS)
  @Type(() => Number)
  wardNumber?: number;

  @ApiProperty({ example: 27.7172 })
  @IsNumber()
  @IsNotEmpty()
  @IsLatitude()
  @Type(() => Number)
  latitude!: number;

  @ApiProperty({ example: 85.324 })
  @IsNumber()
  @IsNotEmpty()
  @IsLongitude()
  @Type(() => Number)
  longitude!: number;

  @ApiProperty({ enum: CuisineType, example: CuisineType.NEPALI })
  @IsEnum(CuisineType)
  @IsNotEmpty()
  cuisineType!: string;

  @ApiPropertyOptional({ example: '09:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  openingTime?: string;

  @ApiPropertyOptional({ example: '22:00:00' })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/)
  closingTime?: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isOpen?: boolean = false;

  @ApiPropertyOptional({ example: 50, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Max(200)
  @Type(() => Number)
  deliveryFee?: number = 0;

  @ApiPropertyOptional({ example: 200, default: 0 })
  @IsNumber()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  minimumOrderAmount?: number = 0;

  @ApiPropertyOptional({ example: 35 })
  @IsOptional()
  @IsNumber()
  @Min(10)
  @Max(120)
  @Type(() => Number)
  estimatedDeliveryTime?: number;

  @ApiProperty({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isVerified?: boolean = false;
}
