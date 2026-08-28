// apps/api/src/notifications/dto/create-notification.dto.ts
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  IsObject,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  @IsUUID('4')
  userId!: string;

  @ApiProperty({
    example: 'order',
    enum: ['order', 'restaurant', 'profile', 'system'],
  })
  @IsString()
  @MaxLength(50)
  type!: string;

  @ApiProperty({ example: 'New Order!' })
  @IsString()
  @MaxLength(255)
  title!: string;

  @ApiProperty({ example: 'You have a new order from John Doe.' })
  @IsString()
  body!: string;

  @ApiPropertyOptional({ example: { orderId: '123' } })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean = false;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  isPushSent?: boolean = false;
}
