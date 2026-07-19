import {
  IsEmail,
  IsOptional,
  IsString,
  Length,
  MinLength,
  Matches,
} from 'class-validator';

export class    RegisterUserDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsEmail()
  @Length(5, 255)
  email!: string;

  @IsString()
  @MinLength(6)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    {
      message:
        'Password must contain uppercase, lowercase and a number',
    },
  )
  password!: string;

  @IsOptional()
  @IsString()
  @Length(7, 10)
  phone?: string;
}