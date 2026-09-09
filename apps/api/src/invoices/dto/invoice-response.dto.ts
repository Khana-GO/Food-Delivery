import { ApiProperty } from '@nestjs/swagger';

export class InvoiceResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  orderId!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  invoiceNumber!: string;

  @ApiProperty()
  subtotal!: number;

  @ApiProperty()
  tax!: number;

  @ApiProperty()
  deliveryFee!: number;

  @ApiProperty()
  discount!: number;

  @ApiProperty()
  total!: number;

  @ApiProperty()
  paymentMethod!: string;

  @ApiProperty()
  paymentStatus!: string;

  @ApiProperty()
  issuedAt!: Date;

  @ApiProperty()
  paidAt?: Date;

  @ApiProperty()
  createdAt!: Date;

  // Optional enrichment
  @ApiProperty()
  orderStatus?: string;

  @ApiProperty()
  restaurantName?: string;

  @ApiProperty()
  customerName?: string;
}
