import { ApiProperty } from '@nestjs/swagger';

export class AddressResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  userId!: string;

  @ApiProperty({ required: false, nullable: true })
  label?: string | null;

  @ApiProperty()
  addressLine!: string;

  @ApiProperty()
  city!: string;

  @ApiProperty({ required: false, nullable: true })
  state?: string | null;

  @ApiProperty()
  country!: string;

  @ApiProperty({ required: false, nullable: true })
  postalCode?: string | null;

  @ApiProperty({ required: false, nullable: true })
  latitude?: number | null;

  @ApiProperty({ required: false, nullable: true })
  longitude?: number | null;

  @ApiProperty()
  isDefault!: boolean;

  @ApiProperty()
  createdAt!: Date;

  @ApiProperty()
  updatedAt!: Date;

  constructor(partial: Partial<AddressResponseDto>) {
    Object.assign(this, partial);
  }

  static fromEntity(entity: Record<string, any>): AddressResponseDto {
    return new AddressResponseDto({
      id: entity.id,
      userId: entity.userId,
      label: entity.label ?? undefined,
      addressLine: entity.addressLine,
      city: entity.city,
      state: entity.state ?? undefined,
      country: entity.country,
      postalCode: entity.postalCode ?? undefined,
      latitude: entity.latitude ?? undefined,
      longitude: entity.longitude ?? undefined,
      isDefault: entity.isDefault,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }
}
