import { ApiProperty } from '@nestjs/swagger';
import type { MenuItem } from '../../db/schema';

export class MenuItemResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  categoryId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  price!: number;

  @ApiProperty()
  imageUrl?: string;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(item: MenuItem) {
    this.id = item.id;
    this.restaurantId = item.restaurantId;
    this.categoryId = item.categoryId;
    this.name = item.name;
    this.description = item.description ?? undefined;
    this.price = Number(item.price);
    this.imageUrl = item.imageUrl ?? undefined;
    this.isAvailable = item.isAvailable;
    this.createdAt = item.createdAt;
    this.updatedAt = item.updatedAt;
  }
}
