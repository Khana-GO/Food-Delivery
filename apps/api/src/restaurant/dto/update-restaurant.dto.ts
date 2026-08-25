// apps/api/src/restaurants/dto/update-restaurant.dto.ts
// Text-only updates. Logo / cover images must go through the dedicated
// image endpoints (POST/PUT :id/images, DELETE :id/logo, DELETE :id/cover)
// and verification is managed by admins only.
import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
