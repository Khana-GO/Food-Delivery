// apps/api/src/restaurants/dto/restaurant-response.dto.ts

import { ApiProperty } from '@nestjs/swagger';
import { CuisineType } from './create-restaurant.dto';

export class RestaurantResponseDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id!: string;

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  ownerId!: string;

  @ApiProperty({
    example: 'Himalayan Spice Kitchen',
  })
  name!: string;

  @ApiProperty({
    example: 'himalayan-spice-kitchen',
  })
  slug!: string;

  @ApiProperty({
    example: 'Authentic Nepali and Indian cuisine',
  })
  description?: string;

  @ApiProperty({
    example: 'https://example.com/logo.jpg',
  })
  logoUrl?: string;

  @ApiProperty({
    example: 'https://example.com/cover.jpg',
  })
  coverImageUrl?: string;

  @ApiProperty({
    example: '9812345678',
  })
  phone?: string;

  @ApiProperty({
    example: 'info@himalayanspice.com',
  })
  email?: string;

  // ─── Local Address ───

  @ApiProperty({
    example: 'Bhagwati Marg, Ward 3, Kathmandu Metropolitan City',
  })
  address!: string;

  @ApiProperty({
    example: 3,
  })
  wardNumber?: number;

  @ApiProperty({
    example: 27.7172,
  })
  latitude!: number;

  @ApiProperty({
    example: 85.324,
  })
  longitude!: number;

  @ApiProperty({
    enum: CuisineType,
    example: 'Nepali',
  })
  cuisineType!: string;

  @ApiProperty({
    description: 'Menu categories served by this restaurant',
    example: ['Momo', 'Chowmein', 'Snacks'],
  })
  categories?: { id: string; name: string }[];

  @ApiProperty({
    example: '09:00:00',
  })
  openingTime?: string;

  @ApiProperty({
    example: '22:00:00',
  })
  closingTime?: string;

  @ApiProperty({
    example: 4.5,
  })
  averageRating!: number;

  @ApiProperty({
    example: 120,
  })
  totalReviews!: number;

  @ApiProperty({
    example: 50,
  })
  deliveryFee!: number;

  @ApiProperty({
    example: 200,
  })
  minimumOrderAmount!: number;

  @ApiProperty({
    example: 35,
  })
  estimatedDeliveryTime?: number;

  @ApiProperty({
    example: true,
  })
  isOpen!: boolean;

  @ApiProperty({
    example: true,
  })
  isActive!: boolean;

  @ApiProperty({
    example: true,
  })
  isVerified!: boolean;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    example: null,
  })
  deletedAt?: Date;
}
