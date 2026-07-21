import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AddressService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  async create(createAddressDto: any, userId: string) {
    const id = uuidv4();
    if (createAddressDto.isDefault) {
      await this.db.update(schema.addressesTable)
        .set({ isDefault: false })
        .where(eq(schema.addressesTable.userId, userId));
    }

    await this.db.insert(schema.addressesTable).values({
      id,
      userId,
      fullAddress: createAddressDto.fullAddress,
      city: createAddressDto.city || 'Kathmandu',
      state: createAddressDto.state || 'Bagmati',
      country: createAddressDto.country || 'Nepal',
      postalCode: createAddressDto.postalCode,
      isDefault: createAddressDto.isDefault || false,
    });

    return { id, success: true };
  }

  async findAll(userId: string) {
    return await this.db.query.addressesTable.findMany({
      where: eq(schema.addressesTable.userId, userId),
      orderBy: (addresses, { desc }) => [desc(addresses.isDefault)],
    });
  }

  async update(id: string, userId: string, updateAddressDto: any) {
    if (updateAddressDto.isDefault) {
      await this.db.update(schema.addressesTable)
        .set({ isDefault: false })
        .where(eq(schema.addressesTable.userId, userId));
    }
    
    await this.db.update(schema.addressesTable)
      .set({ ...updateAddressDto, updatedAt: new Date() })
      .where(and(eq(schema.addressesTable.id, id), eq(schema.addressesTable.userId, userId)));
      
    return { id, success: true };
  }

  async remove(id: string, userId: string) {
    await this.db.delete(schema.addressesTable)
      .where(and(eq(schema.addressesTable.id, id), eq(schema.addressesTable.userId, userId)));
    return { success: true };
  }
}
