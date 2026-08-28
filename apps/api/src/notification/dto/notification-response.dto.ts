// apps/api/src/notifications/dto/notification-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class NotificationResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty()
  type!: string;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  body!: string;

  @ApiProperty()
  data?: any;

  @ApiProperty()
  isRead!: boolean;

  @ApiProperty()
  isPushSent!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty({ required: false, nullable: true })
  readAt?: Date | null;

  constructor(partial: Partial<NotificationResponseDto>) {
    Object.assign(this, partial);
  }
}
