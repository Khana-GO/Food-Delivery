// apps/api/src/restaurants/dto/update-restaurant.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateRestaurantDto } from './create-restaurant.dto';

export class UpdateRestaurantDto extends PartialType(CreateRestaurantDto) {}
