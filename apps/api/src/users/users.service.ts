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

  async findByEmail(email: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.email, email.trim().toLowerCase()),
    });
  }

  async findByVerificationTokenHash(tokenHash: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.verificationToken, tokenHash),
    });
  }

  async findByResetTokenHash(tokenHash: string) {
    return this.db.query.usersTable.findFirst({
      where: eq(usersTable.resetToken, tokenHash),
    });
  }

  async findById(id: string) {
    return this.db.query.usersTable.findFirst({ where: eq(usersTable.id, id) });
  }

  async create(data: NewUsersTable) {
    const [newUser] = await this.db.insert(usersTable).values(data).returning();
    return newUser;
  }

  async markAsVerified(userId: string) {
    await this.db.update(usersTable)
      .set({
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiry: null,
        verifiedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async setResetToken(userId: string, tokenHash: string, expiry: Date) {
    await this.db.update(usersTable)
      .set({
        resetToken: tokenHash,
        resetTokenExpiry: expiry,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async updatePassword(userId: string, hashedPassword: string) {
    await this.db.update(usersTable)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(usersTable.id, userId));
  }

  async recordLogin(userId: string) {
    await this.db.update(usersTable).set({ lastLoginAt: new Date(), updatedAt: new Date() }).where(eq(usersTable.id, userId));
  }
}
