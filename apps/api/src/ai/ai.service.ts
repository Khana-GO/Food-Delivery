/* eslint-disable no-empty */
import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { KhanaGoAgent } from '../agents/khana-go.agent';
import { ChatRequest, ChatResponse } from '@food_delivery/types';
import { DATABASE } from '../db/database.constants';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { chatMessagesTable } from '../db/schema/chat.message.schema';
import { eq, desc } from 'drizzle-orm';

export interface Session {
  id: string;
  userId: string;
  createdAt: Date;
  /** Epoch ms of the last read/write — drives idle-TTL eviction. */
  lastUsedAt: number;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
}

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);
  private sessions: Map<string, Session> = new Map();
  private rateLimit: Map<string, { count: number; resetAt: number }> =
    new Map();

  // In-memory caches must be bounded: without eviction they grow with every
  // user that ever chats, eventually OOM-ing the process.
  private static readonly SESSION_IDLE_TTL_MS = 2 * 60 * 60 * 1000; // 2h
  private static readonly MAX_SESSIONS = 1000;
  private static readonly MAX_RATE_LIMIT_ENTRIES = 5000;

  /** Drops expired/idle entries and caps both maps. Cheap — O(n) on cap only. */
  private pruneCaches(now: number) {
    for (const [key, entry] of this.rateLimit) {
      if (now > entry.resetAt) this.rateLimit.delete(key);
    }
    while (this.rateLimit.size > AIService.MAX_RATE_LIMIT_ENTRIES) {
      const oldest = this.rateLimit.keys().next().value;
      if (!oldest) break;
      this.rateLimit.delete(oldest);
    }

    if (this.sessions.size >= AIService.MAX_SESSIONS) {
      for (const [id, session] of this.sessions) {
        if (now - session.lastUsedAt > AIService.SESSION_IDLE_TTL_MS) {
          this.sessions.delete(id);
        }
      }
      while (this.sessions.size > AIService.MAX_SESSIONS) {
        const oldest = this.sessions.keys().next().value;
        if (!oldest) break;
        this.sessions.delete(oldest);
      }
    }
  }

  constructor(
    private readonly agent: KhanaGoAgent,
    @Inject(DATABASE) private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── Process Chat Message ───
  async processChat(request: ChatRequest): Promise<ChatResponse> {
    const { message, userId, sessionId, context } = request;

    // Validation
    if (!message || !message.trim()) {
      throw new BadRequestException('Message is required');
    }
    if (message.length > 1000) {
      throw new BadRequestException('Message too long (max 1000 chars)');
    }
    if (!userId) {
      throw new BadRequestException('User ID is required');
    }

    // Simple rate limit: 20 messages per minute per user
    this.pruneCaches(Date.now());
    this.checkRateLimit(userId);

    try {
      // ─── Get or create session ───
      const effectiveSessionId = sessionId?.trim() || randomUUID();
      let session = this.sessions.get(effectiveSessionId);
      // Verify session belongs to user if it exists
      if (session && session.userId !== userId) {
        // Session hijacking attempt -> create new session
        session = undefined;
      }
      if (!session) {
        session = {
          id: effectiveSessionId,
          userId,
          createdAt: new Date(),
          lastUsedAt: Date.now(),
          messages: [],
        };
        this.sessions.set(session.id, session);
        // Try to hydrate from DB for existing session
        try {
          const history = await this.db
            .select()
            .from(chatMessagesTable)
            .where(eq(chatMessagesTable.sessionId, session.id))
            .orderBy(desc(chatMessagesTable.createdAt))
            .limit(20);
          if (history.length) {
            session.messages = history.reverse().map((h) => ({
              role: h.role,
              content: h.message,
              timestamp: h.createdAt,
            }));
          }
        } catch {}
      }

      // Persist user message immediately (best-effort, don't block agent)
      this.persistMessage(userId, session.id, 'user', message).catch((e) =>
        this.logger.debug(`Persist user message skipped: ${e.message}`),
      );

      // ─── Process with agent (pass sessionId for correct history isolation) ───
      const result = await this.agent.processMessage(
        userId,
        message,
        context,
        session.id,
      );

      // ─── Save to session memory ───
      session.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date(),
      });
      session.messages.push({
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      });

      // Keep memory bounded (last 50 messages per session)
      if (session.messages.length > 50) {
        session.messages = session.messages.slice(-50);
      }
      session.lastUsedAt = Date.now();

      // Persist assistant message
      this.persistMessage(
        userId,
        session.id,
        'assistant',
        result.response,
      ).catch((e) =>
        this.logger.debug(`Persist assistant skipped: ${e.message}`),
      );

      // Cleanup old sessions (idle TTL + hard cap, LRU via insertion order)
      this.pruneCaches(Date.now());

      return {
        response: result.response,
        quickReplies: result.quickReplies,
        intent: result.intent,
        sessionId: session.id,
      };
    } catch (error: any) {
      this.logger.error(
        `Chat error for user ${userId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  // ─── Clear Session ───
  async clearSession(sessionId: string, userId?: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session && userId && session.userId !== userId) {
      throw new BadRequestException('Not your session');
    }
    this.sessions.delete(sessionId);
    this.agent.clearHistory(sessionId);
    // Delete from DB best-effort
    try {
      await this.db
        .delete(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, sessionId));
    } catch (e: any) {
      this.logger.debug(`Delete session skipped: ${e.message}`);
    }
  }

  // ─── Get Session History ───
  async getHistory(
    sessionId: string,
    userId?: string,
  ): Promise<Session | null> {
    const session = this.sessions.get(sessionId);
    if (session) {
      if (userId && session.userId !== userId)
        throw new BadRequestException('Not your session');
      return session;
    }
    // Fetch from DB if not in memory
    try {
      const rows = await this.db
        .select()
        .from(chatMessagesTable)
        .where(eq(chatMessagesTable.sessionId, sessionId))
        .orderBy(chatMessagesTable.createdAt);
      if (!rows.length) return null;
      // Verify ownership from first row
      if (userId && rows[0].userId !== userId)
        throw new BadRequestException('Not your session');
      const hydrated: Session = {
        id: sessionId,
        userId: rows[0].userId,
        createdAt: rows[0].createdAt,
        lastUsedAt: Date.now(),
        messages: rows.map((r) => ({
          role: r.role as any,
          content: r.message,
          timestamp: r.createdAt,
        })),
      };
      this.sessions.set(sessionId, hydrated);
      return hydrated;
    } catch (e: any) {
      if (e instanceof BadRequestException) throw e;
      return null;
    }
  }

  private async persistMessage(
    userId: string,
    sessionId: string,
    role: 'user' | 'assistant',
    message: string,
  ) {
    try {
      await this.db.insert(chatMessagesTable).values({
        id: randomUUID(),
        userId,
        sessionId,
        role: role as any,
        message: message.slice(0, 4000),
      });
    } catch (e: any) {
      // Column session_id may not exist on older DB – retry without it
      if (
        e?.message?.includes('session_id') ||
        e?.message?.includes('sessionId')
      ) {
        try {
          await this.db.insert(chatMessagesTable).values({
            id: randomUUID(),
            userId,
            role: role as any,
            message: message.slice(0, 4000),
          });
          return;
        } catch {}
      }
      throw e;
    }
  }

  private checkRateLimit(userId: string) {
    const now = Date.now();
    const entry = this.rateLimit.get(userId);
    if (!entry || now > entry.resetAt) {
      // Refresh insertion order so LRU eviction drops truly stale users.
      this.rateLimit.delete(userId);
      this.rateLimit.set(userId, { count: 1, resetAt: now + 60_000 });
      return;
    }
    if (entry.count >= 20) {
      throw new BadRequestException(
        'Rate limit exceeded. Please wait a moment.',
      );
    }
    entry.count += 1;
  }
}
