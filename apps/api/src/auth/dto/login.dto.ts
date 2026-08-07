import { IsEmail, IsOptional, IsString, Length } from 'class-validator';

export class LoginUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
