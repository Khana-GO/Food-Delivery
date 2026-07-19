// src/auth/dto/logout.dto.ts
import { IsString, IsNotEmpty } from 'class-validator';

export class LogoutDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}