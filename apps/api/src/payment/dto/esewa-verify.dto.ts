import { IsUUID, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class EsewaVerifyDto {
  @ApiPropertyOptional({ example: 'base64-encoded-callback-data' })
  @IsOptional()
  @IsString()
  data?: string;

  @ApiPropertyOptional({ example: 'refId fallback (legacy)' })
  @IsOptional()
  @IsString()
  refId?: string;

  @ApiPropertyOptional({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsOptional()
  @IsUUID('4')
  orderId?: string;

  @ApiPropertyOptional({ example: '650.00' })
  @IsOptional()
  @IsString()
  totalAmount?: string;

  @ApiPropertyOptional({ example: 'transaction-uuid' })
  @IsOptional()
  @IsString()
  transactionUuid?: string;
}
