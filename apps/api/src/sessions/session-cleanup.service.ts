import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';

/**
 * Keeps the sessions table from growing forever.
 *
 * - Rows are hard-deleted when the refresh token expires, or after 10
 *   days at the latest (retention window).
 * - Logout already deletes the row immediately via
 *   SessionsService.revoke()/revokeByToken(); this job only handles
 *   sessions abandoned without logging out.
 */
@Injectable()
export class SessionCleanupService implements OnModuleInit {
  private readonly logger = new Logger(SessionCleanupService.name);

  constructor(private readonly sessionsService: SessionsService) {}

  /** Run once shortly after boot so long-idle databases get cleaned too. */
  async onModuleInit() {
    await this.runCleanup({ retries: 5, baseDelayMs: 2000, maxDelayMs: 30000 });
  }

  // Every day at 03:00
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCleanup() {
    await this.runCleanup({ retries: 3, baseDelayMs: 5000, maxDelayMs: 60000 });
  }

  private async runCleanup(
    options: {
      retries?: number;
      baseDelayMs?: number;
      maxDelayMs?: number;
    } = {},
  ) {
    const { retries = 0, baseDelayMs = 2000, maxDelayMs = 30000 } = options;
    let attempt = 0;

    while (true) {
      try {
        const deleted = await this.sessionsService.cleanupExpiredSessions(10);
        if (deleted > 0) {
          this.logger.log(`Deleted ${deleted} stale session(s)`);
        }
        return;
      } catch (error) {
        attempt++;
        const isTransient = this.isTransientError(error);

        if (attempt > retries || !isTransient) {
          if (isTransient) {
            this.logger.warn(
              `Session cleanup failed after ${attempt} attempts (transient errors). Will retry on next scheduled run.`,
            );
          } else {
            this.logger.error(
              'Session cleanup failed with non-transient error',
              error as Error,
            );
          }
          return;
        }

        const delay = Math.min(
          baseDelayMs * Math.pow(2, attempt - 1),
          maxDelayMs,
        );
        this.logger.warn(
          `Session cleanup attempt ${attempt} failed (${(error as Error).message}), retrying in ${delay}ms`,
        );
        await sleepWithJitter(delay);
      }
    }
  }

  private isTransientError(error: unknown): boolean {
    if (!(error instanceof Error)) return false;

    const transientCodes = [
      'EAI_AGAIN',
      'ETIMEDOUT',
      'ECONNRESET',
      'ENOTFOUND',
      'ENETUNREACH',
    ];
    const transientMessages = [
      'getaddrinfo',
      'connection timeout',
      'socket hang up',
      'network is unreachable',
      'temporary failure',
    ];

    return (
      transientCodes.some((code) => error.message.includes(code)) ||
      transientMessages.some((msg) => error.message.toLowerCase().includes(msg))
    );
  }
}

function sleepWithJitter(baseMs: number): Promise<void> {
  const jitter = Math.floor(Math.random() * baseMs * 0.3);
  return new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
}
