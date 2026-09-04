import { ApiProperty } from '@nestjs/swagger';

export class PromotionResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  code!: string;

  @ApiProperty()
  description?: string;

  @ApiProperty()
  discountType!: string;

  @ApiProperty()
  discountValue!: number;

  @ApiProperty()
  minOrderAmount!: number;

  @ApiProperty()
  maxDiscount?: number;

  @ApiProperty()
  usageLimit!: number;

  @ApiProperty()
  usedCount!: number;

  @ApiProperty()
  validFrom!: Date;

  @ApiProperty()
  validUntil!: Date;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;
}

export class PromotionValidationResultDto {
  @ApiProperty()
  valid!: boolean;

  @ApiProperty()
  message!: string;

  @ApiProperty()
  discountAmount?: number;

  @ApiProperty()
  discountType?: string;

  @ApiProperty()
  discountValue?: number;
}
