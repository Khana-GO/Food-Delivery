// src/sessions/sessions.service.ts
import { Inject, Injectable, Logger } from '@nestjs/common';
import { eq, and, lt, or } from 'drizzle-orm';
import * as crypto from 'crypto';
import { DATABASE } from '../db/database.constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { sessionsTable } from '../db/schema';
import { CacheService } from '../redis/cache.service';
// import your DB provider

@Injectable()
export class SessionsService {
  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  /** Shared-store keys so revocations survive restarts / multiple instances. */
  private static readonly REVOKED_TOKEN_PREFIX = 'auth:revoked:token:';
  private static readonly REVOKED_USER_PREFIX = 'auth:revoked:user:';
  /** Longest refresh-token lifetime — bounds how long entries must be kept. */
  private static readonly REVOCATION_TTL_SECONDS = 30 * 24 * 60 * 60;

  /** Process-local mirror (fast path + fallback when Redis is unavailable). */
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

  /** Reads a user-level revocation timestamp (memory first, then shared store). */
  private async getUserRevokedAt(userId: string): Promise<number | undefined> {
    const local = this.revokedUsers.get(userId);
    if (local !== undefined) return local;

    const shared = await this.cache.get<number>(
      SessionsService.REVOKED_USER_PREFIX + userId,
    );
    if (typeof shared === 'number' && shared > 0) {
      // Mirror locally so subsequent checks in this process stay cheap.
      this.revokedUsers.set(userId, shared);
      return shared;
    }
    return undefined;
  }

  async isTokenRevoked(
    token: string,
    identity?: { userId?: string; issuedAtSeconds?: number },
  ): Promise<boolean> {
    this.pruneUserRevocations();

    if (identity?.userId) {
      const revokedAt = await this.getUserRevokedAt(identity.userId);
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

    const hash = this.hashToken(token);
    if (this.revokedTokens.has(hash)) return true;

    const shared = await this.cache.get<boolean>(
      SessionsService.REVOKED_TOKEN_PREFIX + hash,
    );
    if (shared === true) {
      this.revokedTokens.add(hash);
      return true;
    }
    return false;
  }

  async revokeToken(token: string, userId?: string): Promise<void> {
    const hash = this.hashToken(token);
    this.revokedTokens.add(hash);
    await this.cache.set(
      SessionsService.REVOKED_TOKEN_PREFIX + hash,
      true,
      SessionsService.REVOCATION_TTL_SECONDS,
    );

    if (userId) {
      const now = Date.now();
      this.revokedUsers.set(userId, now);
      await this.cache.set(
        SessionsService.REVOKED_USER_PREFIX + userId,
        now,
        SessionsService.REVOCATION_TTL_SECONDS,
      );
    }
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
    const now = Date.now();
    this.revokedUsers.set(userId, now);
    await this.cache.set(
      SessionsService.REVOKED_USER_PREFIX + userId,
      now,
      SessionsService.REVOCATION_TTL_SECONDS,
    );
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
