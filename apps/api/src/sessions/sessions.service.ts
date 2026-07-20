// src/sessions/sessions.service.ts
import { Inject, Injectable } from '@nestjs/common';
import { eq, and, lt } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema'
import { sessionsTable } from '../db/schema';
// import your DB provider

@Injectable()
export class SessionsService {
 constructor(
     @Inject(DATABASE)
     private readonly db: NeonHttpDatabase<typeof schema>,
   ) {}

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  async create(
    userId: string,
    refreshToken: string,
    expiresAt: Date,
    meta?: { userAgent?: string; ipAddress?: string },
    sessionId?: string,
  ) {
    const [session] = await this.db
      .insert(sessionsTable)
      .values({
        id: sessionId,
        userId,
        refreshTokenHash: this.hashToken(refreshToken),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt,
      })
      .returning();
    return session;
  }

  async findValidByIdAndToken(sessionId: string, refreshToken: string) {
    const [session] = await this.db
      .select()
      .from(sessionsTable)
      .where(eq(sessionsTable.id, sessionId));

    if (!session) return null;
    if (session.refreshTokenHash !== this.hashToken(refreshToken)) return null;
    if (session.expiresAt <= new Date()) return null;

    return session;
  }

  async revoke(sessionId: string) {
    const removed = await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.id, sessionId))
      .returning();
    return removed.length;
  }

  async revokeByToken(refreshToken: string) {
    const removed = await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.refreshTokenHash, this.hashToken(refreshToken)))
      .returning();
    return removed.length;
  }

  async revokeAllForUser(userId: string) {
    const removed = await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .returning();
    return removed.length;
  }
}