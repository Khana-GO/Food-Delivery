import { IsUUID, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID('4')
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsInt()
  @Min(1)
  quantity: number = 1;
}
