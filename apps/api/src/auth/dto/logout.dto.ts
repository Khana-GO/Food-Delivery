// src/auth/dto/logout.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
