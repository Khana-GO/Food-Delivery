import { IsNumber, IsUUID, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateLocationDto {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Order UUID',
  })
  @IsUUID('4')
  orderId!: string;

  @ApiProperty({ example: 27.7172 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-90)
  @Max(90)
  latitude!: number;

  @ApiProperty({ example: 85.324 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 6 })
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiPropertyOptional({ example: 10, description: 'Accuracy in meters' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(10000)
  accuracy?: number;

  @ApiPropertyOptional({ example: 12.5, description: 'Speed in m/s' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(100)
  speed?: number;

  @ApiPropertyOptional({ example: 45, description: 'Heading 0-360 deg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(360)
  heading?: number;

  @ApiPropertyOptional({ example: 1350, description: 'Altitude meters' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(-500)
  @Max(9000)
  altitude?: number;
}
