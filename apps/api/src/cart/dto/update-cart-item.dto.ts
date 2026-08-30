import { IsUUID, IsInt, Min, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID('4')
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(0)
  quantity!: number;
}
