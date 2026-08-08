import { IsEnum, IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@food_delivery/types';

export class ChangeRoleDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'User ID',
  })
  @IsUUID('4', { message: 'Invalid user ID format' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId!: string;

  @ApiProperty({
    enum: UserRole,
    example: UserRole.ADMIN,
    description: 'New user role',
  })
  @IsEnum(UserRole, { message: 'Invalid user role' })
  role!: UserRole;
}