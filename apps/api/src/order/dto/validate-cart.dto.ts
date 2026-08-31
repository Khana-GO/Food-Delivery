import {
  IsArray,
  ValidateNested,
  IsUUID,
  IsNumber,
  IsInt,
  Min,
  IsNotEmpty,
  IsPositive,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ValidateCartItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID('4')
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity!: number;

  @ApiProperty({
    example: 299,
    description: 'Client price for change detection (ignored for security)',
  })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  @Min(0)
  unitPrice!: number;
}

export class ValidateCartDto {
  @ApiProperty({ type: [ValidateCartItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ValidateCartItemDto)
  items!: ValidateCartItemDto[];
}
