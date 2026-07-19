import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { usersTable, type NewUsersTable } from '../db/schema/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE)
    private readonly db: NeonHttpDatabase<typeof schema>,
  ) {}

  async findByPhone(phone: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.phone, phone.trim()),
    });
  }

  async findById(id: string) {
    return this.db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });
  }

  async create(data: NewUsersTable) {
    const [newUser] = await this.db.insert(usersTable).values(data).returning();
    return newUser;
  }

  async setOtp(userId: string, otpCode: string, expiry: Date) {
    await this.db.update(usersTable)
      .set({
        otpCode,
        otpExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async verifyAndClearOtp(userId: string) {
    await this.db.update(usersTable)
      .set({
        isVerified: true,
        otpCode: null,
        otpExpiry: null,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async recordLogin(userId: string) {
    await this.db.update(usersTable).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(usersTable.id, userId));
  }
}
