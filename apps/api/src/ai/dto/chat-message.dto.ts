import {
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
  Length,
  ValidateNested,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatLocationDto {
  @ApiProperty({ example: 27.7172 })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat!: number;

  @ApiProperty({ example: 85.324 })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng!: number;
}

export class ChatContextDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  restaurantId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({ type: ChatLocationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatLocationDto)
  @IsObject()
  location?: ChatLocationDto;
}

export class ChatMessageDto {
  @ApiProperty({
    example: 'What restaurants are open now?',
    description: 'User message (1-1000 chars)',
  })
  @IsString()
  @Length(1, 1000)
  message!: string;

  @ApiPropertyOptional({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID session ID – omit to start new session',
  })
  @IsOptional()
  @IsUUID('4')
  sessionId?: string;

  @ApiPropertyOptional({
    type: ChatContextDto,
    example: { restaurantId: 'uuid', orderId: 'uuid' },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ChatContextDto)
  @IsObject()
  context?: ChatContextDto;
}

export class ChatRequestDto {
  message!: string;
  userId!: string;
  sessionId?: string;
  context?: {
    restaurantId?: string;
    orderId?: string;
    location?: { lat: number; lng: number };
  };
}

export class ChatResponseDto {
  @ApiProperty()
  response!: string;

  @ApiProperty({ type: [String] })
  quickReplies?: string[];

  @ApiProperty()
  intent?: string;

  @ApiProperty()
  sessionId!: string;
}
