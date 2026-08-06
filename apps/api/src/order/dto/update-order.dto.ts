import { IsEnum, IsOptional } from 'class-validator';
import {
  orderStatusEnum,
  paymentStatusEnum,
} from '../../db/schema/order.schema';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(orderStatusEnum.enumValues)
  orderStatus?: (typeof orderStatusEnum.enumValues)[number];

  @IsOptional()
  @IsEnum(paymentStatusEnum.enumValues)
  paymentStatus?: (typeof paymentStatusEnum.enumValues)[number];
}