import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { paymentMethodEnum } from '../../db/schema/order.schema';

class OrderItemDto {
  @IsUUID()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;
}

export class CreateOrderDto {
  @IsUUID()
  restaurantId!: string;

  @IsUUID()
  addressId!: string;

  @IsEnum(paymentMethodEnum.enumValues)
  paymentMethod!: (typeof paymentMethodEnum.enumValues)[number];

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  specialInstructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items!: OrderItemDto[];
}