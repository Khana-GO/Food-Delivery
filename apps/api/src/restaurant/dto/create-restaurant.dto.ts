import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsNumber,
  IsLatitude,
  IsLongitude,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsString()
  @IsNotEmpty()
  addressLine!: string;

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsNotEmpty()
  country!: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsLatitude()
  latitude!: number;

  @IsLongitude()
  longitude!: number;

  @IsString()
  @IsNotEmpty()
  cuisineType!: string;

  @IsOptional()
  @IsString()
  openingTime?: string; // HH:mm:ss

  @IsOptional()
  @IsString()
  closingTime?: string; // HH:mm:ss

  @IsOptional()
  @IsNumber()
  deliveryFee?: number;

  @IsOptional()
  @IsNumber()
  minimumOrderAmount?: number;

  @IsOptional()
  @IsInt()
  estimatedDeliveryTime?: number;
}