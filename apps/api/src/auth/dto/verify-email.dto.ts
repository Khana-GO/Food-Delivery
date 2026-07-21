import { IsString, IsNotEmpty, IsEmail, Length, IsNumberString } from 'class-validator';
export class VerifyEmailDto {
  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @Length(6, 6)
  @IsNumberString()
  code!: string;
}