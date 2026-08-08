import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@food_delivery/types';

export class UserResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id!: string;

  @ApiProperty({ example: 'John' })
  firstName!: string;

  @ApiProperty({ example: 'Doe' })
  lastName!: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email!: string;

  @ApiProperty({ example: '+1234567890', nullable: true })
  phone?: string | null;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER })
  role!: UserRole;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  imageUrl?: string | null;

  @ApiProperty({ example: false })
  isOnline!: boolean;

  @ApiProperty({ example: true })
  isVerified!: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z', nullable: true })
  lastLoginAt?: Date | null;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt!: Date;

  @ApiProperty({ example: null, nullable: true })
  deletedAt?: Date | null;

  constructor(partial: Partial<UserResponseDto> = {}) {
    Object.assign(this, partial);
  }
}