// src/auth/dto/resend-verification.dto.ts
import { IsEmail } from 'class-validator';

export class ResendVerificationDto {
  @IsEmail()
  email!: string;
}