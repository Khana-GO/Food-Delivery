import { IsString, Length, Matches } from 'class-validator';

export class RegisterUserDto {
  @IsString()
  @Length(2, 100)
  firstName!: string;

  @IsString()
  @Length(2, 100)
  lastName!: string;

  @IsString()
  @Length(10, 15)
  @Matches(/^\+?\d+$/, { message: 'Must be a valid phone number' })
  phone!: string;
}