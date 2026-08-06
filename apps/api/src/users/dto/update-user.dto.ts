import {
  IsEmail,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @Length(2, 100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(2, 100)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  imageUrl?: string;
}