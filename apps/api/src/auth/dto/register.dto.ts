import { IsEmail, IsOptional, IsString, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @Length(7, 20)
  phone!: string;

  @IsOptional()
  @IsString()
  @Length(6, 128)
  password?: string;
}