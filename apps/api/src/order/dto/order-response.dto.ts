import { ApiProperty } from '@nestjs/swagger';

export class OrderItemResponseDto {
  @ApiProperty()
  id!: string;

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
}

export class OrderResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  customerName!: string;

  @ApiProperty()
  customerPhone!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  restaurantName!: string;

  @ApiProperty()
  restaurantAddress!: string;

  @ApiProperty()
  driverId?: string;

  @ApiProperty()
  driverName?: string;

  @ApiProperty()
  addressId!: string;

  @ApiProperty()
  deliveryAddress!: string;

  @ApiProperty({ type: [OrderItemResponseDto] })
  items!: OrderItemResponseDto[];

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  deliveryFee!: number;

  @ApiProperty()
  totalAmount!: number;

  @ApiProperty()
  notes?: string;

  @ApiProperty()
  paymentMethod!: string;

  @ApiProperty()
  paymentStatus!: string;

  @ApiProperty()
  orderStatus!: string;

  @ApiProperty({ required: false })
  estimatedDeliveryTime?: Date;

  @ApiProperty({ required: false })
  estimatedDeliveryMinutes?: number;

  @ApiProperty({ required: false })
  deliveredAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(partial: Partial<OrderResponseDto>) {
    Object.assign(this, partial);
  }
}
