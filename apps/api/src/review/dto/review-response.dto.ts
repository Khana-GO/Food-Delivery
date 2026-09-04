import { ApiProperty } from '@nestjs/swagger';

export class ReviewResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  customerId!: string;

  @ApiProperty()
  customerName!: string;

  @ApiProperty()
  restaurantId!: string;

  @ApiProperty()
  restaurantName!: string;

  @ApiProperty()
  itemId?: string;

  @ApiProperty()
  itemName?: string;

  @ApiProperty()
  rating!: number;

  @ApiProperty()
  comment?: string;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}
