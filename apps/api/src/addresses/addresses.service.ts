import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
  InternalServerErrorException,
  Inject,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  addressesTable,
  type NewAddress,
} from '../db/schema/user.address.schema';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { AddressResponseDto } from './dto/address-response.dto';
import * as schema from '../db/schema';

@Injectable()
export class AddressesService {
  private readonly logger = new Logger(AddressesService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`[${context}] Error:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  // ─── GET ALL ADDRESSES ───
  async findAll(userId: string): Promise<AddressResponseDto[]> {
    return this.handleDbOperation(async () => {
      const addresses = await this.db
        .select()
        .from(addressesTable)
        .where(eq(addressesTable.userId, userId))
        .orderBy(addressesTable.createdAt);
      return addresses.map((a) => new AddressResponseDto(a as any));
    }, 'findAll');
  }

  // ─── GET SINGLE ADDRESS ───
  async findOne(id: string, userId: string): Promise<AddressResponseDto> {
    return this.handleDbOperation(async () => {
      const address = await this.db.query.addressesTable.findFirst({
        where: and(
          eq(addressesTable.id, id),
          eq(addressesTable.userId, userId),
        ),
      });
      if (!address) {
        throw new NotFoundException(`Address with ID ${id} not found`);
      }
      return new AddressResponseDto(address);
    }, 'findOne');
  }

  // ─── CREATE ADDRESS ───
  async create(
    userId: string,
    dto: CreateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.handleDbOperation(async () => {
      // Use transaction to avoid race on isDefault
      if (dto.isDefault) {
        const result = await (this.db as any).transaction(async (tx: any) => {
          await tx
            .update(addressesTable)
            .set({ isDefault: false })
            .where(eq(addressesTable.userId, userId));
          const [address] = await tx
            .insert(addressesTable)
            .values({
              userId,
              label: dto.label || 'Home',
              addressLine: dto.addressLine,
              city: dto.city,
              state: dto.state,
              country: dto.country || 'Nepal',
              postalCode: dto.postalCode,
              latitude: dto.latitude,
              longitude: dto.longitude,
              isDefault: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          return address;
        });
        this.logger.log(`Address created for user ${userId}: ${result.id}`);
        return new AddressResponseDto(result);
      }

      const [address] = await this.db
        .insert(addressesTable)
        .values({
          userId,
          label: dto.label || 'Home',
          addressLine: dto.addressLine,
          city: dto.city,
          state: dto.state,
          country: dto.country || 'Nepal',
          postalCode: dto.postalCode,
          latitude: dto.latitude,
          longitude: dto.longitude,
          isDefault: dto.isDefault || false,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      this.logger.log(`Address created for user ${userId}: ${address.id}`);
      return new AddressResponseDto(address);
    }, 'create');
  }

  // ─── UPDATE ADDRESS ───
  async update(
    id: string,
    userId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    return this.handleDbOperation(async () => {
      await this.findOne(id, userId);

      if (dto.isDefault) {
        const updated = await (this.db as any).transaction(async (tx: any) => {
          await tx
            .update(addressesTable)
            .set({ isDefault: false })
            .where(eq(addressesTable.userId, userId));
          const updateData: Partial<NewAddress> = {
            ...dto,
            isDefault: true,
            updatedAt: new Date(),
          };
          const [row] = await tx
            .update(addressesTable)
            .set(updateData)
            .where(
              and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)),
            )
            .returning();
          return row;
        });
        this.logger.log(`Address updated: ${id}`);
        return new AddressResponseDto(updated);
      }

      const updateData: Partial<NewAddress> = {
        ...dto,
        updatedAt: new Date(),
      };

      const [updated] = await this.db
        .update(addressesTable)
        .set(updateData)
        .where(
          and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)),
        )
        .returning();

      this.logger.log(`Address updated: ${id}`);
      return new AddressResponseDto(updated);
    }, 'update');
  }

  // ─── DELETE ADDRESS ───
  async delete(id: string, userId: string): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const toDelete = await this.findOne(id, userId);
      await this.db
        .delete(addressesTable)
        .where(
          and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)),
        );

      // Auto-promote another address to default if deleted was default
      if ((toDelete as any).isDefault) {
        const another = await this.db.query.addressesTable.findFirst({
          where: eq(addressesTable.userId, userId),
        });
        if (another) {
          await this.db
            .update(addressesTable)
            .set({ isDefault: true, updatedAt: new Date() })
            .where(eq(addressesTable.id, another.id));
        }
      }
      this.logger.log(`Address deleted: ${id}`);
      return { message: 'Address deleted successfully' };
    }, 'delete');
  }

  // ─── SET DEFAULT ───
  async setDefault(id: string, userId: string): Promise<AddressResponseDto> {
    return this.handleDbOperation(async () => {
      const updated = await (this.db as any).transaction(async (tx: any) => {
        await tx
          .update(addressesTable)
          .set({ isDefault: false })
          .where(eq(addressesTable.userId, userId));

        const [row] = await tx
          .update(addressesTable)
          .set({ isDefault: true, updatedAt: new Date() })
          .where(
            and(eq(addressesTable.id, id), eq(addressesTable.userId, userId)),
          )
          .returning();
        if (!row)
          throw new NotFoundException(`Address with ID ${id} not found`);
        return row;
      });

      return new AddressResponseDto(updated);
    }, 'setDefault');
  }
}
