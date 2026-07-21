// src/auth/dto/reset-password.dto.ts
import { IsEmail, IsNotEmpty, IsNumberString, Length, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsEmail()
  email!: string;

  @IsNumberString()
  @Length(6, 6, { message: 'Code must be 6 digits' })
  code!: string;

  @IsNotEmpty()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/, {
    message: 'Password must contain uppercase, lowercase and a number',
  })
  newPassword!: string;
}