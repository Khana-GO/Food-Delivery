// src/sessions/sessions.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, and, lt, or } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DATABASE } from '../db/database.constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { sessionsTable } from '../db/schema';
// import your DB provider

@Injectable()
export class SessionsService {
  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  private readonly revokedTokens = new Set<string>();

  /**
   * userId -> revocation timestamp (epoch ms).
   *
   * A logout must invalidate the user's CURRENT tokens but MUST NOT lock
   * them out forever: tokens issued BEFORE the stored timestamp are
   * rejected, tokens issued after it (fresh login) stay valid.
   */
  private readonly revokedUsers = new Map<string, number>();

  /** In-memory entries older than this are pruned (>= longest refresh life). */
  private static readonly USER_REVOCATION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

  private hashToken(token: string) {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  private pruneUserRevocations() {
    const cutoff = Date.now() - SessionsService.USER_REVOCATION_TTL_MS;
    for (const [userId, at] of this.revokedUsers) {
      if (at < cutoff) this.revokedUsers.delete(userId);
    }
  }

  isTokenRevoked(
    token: string,
    identity?: { userId?: string; issuedAtSeconds?: number },
  ) {
    this.pruneUserRevocations();

    if (identity?.userId) {
      const revokedAt = this.revokedUsers.get(identity.userId);
      if (revokedAt !== undefined) {
        const issuedMs = identity.issuedAtSeconds
          ? identity.issuedAtSeconds * 1000
          : 0;
        // Fail closed for tokens without an iat claim
        if (issuedMs <= revokedAt) {
          return true;
        }
      }
    }

    return this.revokedTokens.has(this.hashToken(token));
  }

  revokeToken(token: string, userId?: string) {
    if (userId) {
      this.revokedUsers.set(userId, Date.now());
    }

    this.revokedTokens.add(this.hashToken(token));
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
    this.revokedUsers.set(userId, Date.now());
    const removed = await this.db
      .delete(sessionsTable)
      .where(eq(sessionsTable.userId, userId))
      .returning();
    return removed.length;
  }

  /**
   * Hard-deletes stale session rows so the table does not grow forever:
   * - sessions past their expiry (refresh token no longer usable), and
   * - any session older than the retention window (default 10 days),
   *   even if somehow still unexpired.
   */
  async cleanupExpiredSessions(retentionDays: number = 10) {
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const removed = await this.db
      .delete(sessionsTable)
      .where(
        or(
          lt(sessionsTable.expiresAt, new Date()),
          lt(sessionsTable.createdAt, cutoff),
        ),
      )
      .returning({ id: sessionsTable.id });

    return removed.length;
  }
}
