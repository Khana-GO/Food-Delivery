import { IsUUID, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EsewaInitDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  orderId!: string;

  @ApiProperty({ example: 650 })
  @IsNumber()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional({ example: 'KhanaGo Order' })
  @IsOptional()
  @IsString()
  productName?: string;
}
