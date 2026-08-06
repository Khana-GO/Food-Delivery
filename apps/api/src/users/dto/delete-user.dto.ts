import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;
}