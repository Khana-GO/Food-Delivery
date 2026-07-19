import { IsLatitude, IsLongitude, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class CreateRestaurantDto {
  @IsString() @Length(2, 255) name!: string;
  @IsString() @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/) slug!: string;
  @IsString() @IsNotEmpty() addressLine!: string;
  @IsString() @Length(2, 100) city!: string;
  @IsString() @Length(2, 100) country!: string;
  @IsLatitude() latitude!: number;
  @IsLongitude() longitude!: number;
  @IsString() @Length(2, 100) cuisineType!: string;
}
