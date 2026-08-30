import { ApiProperty } from '@nestjs/swagger';

export class CartItemDto {
  @ApiProperty()
  menuItemId!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  quantity!: number;

  @ApiProperty()
  unitPrice!: number;

  @ApiProperty()
  totalPrice!: number;

  @ApiProperty({ required: false })
  imageUrl?: string | null;

  @ApiProperty()
  isAvailable!: boolean;

  @ApiProperty({ required: false })
  categoryId?: string;

  @ApiProperty({ required: false })
  restaurantId?: string;
}

export class CartResponseDto {
  @ApiProperty()
  cartId!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty({ type: [CartItemDto] })
  items!: CartItemDto[];

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  totalItems!: number;

  @ApiProperty({ required: false, description: 'Delivery fee from restaurant' })
  deliveryFee?: number;

  @ApiProperty({ required: false })
  minimumOrderAmount?: number;

  @ApiProperty({ required: false })
  restaurantName?: string;

  @ApiProperty({ required: false })
  restaurantIsOpen?: boolean;
}
