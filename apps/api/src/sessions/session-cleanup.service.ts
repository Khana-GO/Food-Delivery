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
    await this.runCleanup({ retries: 5, delayMs: 2000 });
  }

  // Every day at 03:00
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCleanup() {
    await this.runCleanup();
  }

  private async runCleanup(
    options: { retries?: number; delayMs?: number } = {},
  ) {
    const { retries = 0, delayMs = 2000 } = options;
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
        if (attempt > retries) {
          this.logger.error('Session cleanup failed', error as Error);
          return;
        }
        this.logger.warn(
          `Session cleanup attempt ${attempt} failed, retrying in ${delayMs}ms`,
        );
        await sleepWithJitter(delayMs);
      }
    }
  }
}

function sleepWithJitter(baseMs: number): Promise<void> {
  const jitter = Math.floor(Math.random() * baseMs);
  return new Promise((resolve) => setTimeout(resolve, baseMs + jitter));
}
