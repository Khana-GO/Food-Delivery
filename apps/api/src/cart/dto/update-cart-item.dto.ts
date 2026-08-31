import { IsUUID, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateCartItemDto {
  @ApiProperty({ example: 'menu-item-uuid' })
  @IsUUID('4')
  @IsNotEmpty()
  menuItemId!: string;

  @ApiProperty({ example: 2, minimum: 0, maximum: 10 })
  @IsInt()
  @Min(0)
  @Max(10)
  quantity!: number;
}
