import { IsEmail, IsEnum, IsOptional, IsString, Length } from 'class-validator';

export enum SocialProvider {
  GOOGLE = 'GOOGLE',
  FACEBOOK = 'FACEBOOK',
}

export class SocialLoginDto {
  @IsEnum(SocialProvider, { message: 'Provider must be GOOGLE or FACEBOOK' })
  provider!: SocialProvider;

  @IsString()
  @Length(1, 255)
  id!: string;

  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @Length(1, 100)
  firstName!: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  token?: string;
}
