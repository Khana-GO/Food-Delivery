import { IsString, Length, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Length(10, 15)
  @Matches(/^\+?\d+$/, { message: 'Must be a valid phone number' })
  phone!: string;

  @IsString()
  @Length(4, 6)
  otp!: string;
}
