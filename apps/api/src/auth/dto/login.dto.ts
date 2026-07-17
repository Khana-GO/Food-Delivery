import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class LoginUserDto {
  @IsEmail()
  @Length(5, 255)
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
