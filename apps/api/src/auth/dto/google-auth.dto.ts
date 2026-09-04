// apps/api/src/auth/dto/google-auth.dto.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsEmail } from 'class-validator';

export class GoogleAuthDto {
  @ApiProperty({ example: 'eyJhbGciOiJ...' })
  @IsString()
  idToken!: string;

  @ApiPropertyOptional({ example: 'customer@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ example: 'John' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'https://lh3.google.com/...' })
  @IsOptional()
  @IsString()
  picture?: string;
}
