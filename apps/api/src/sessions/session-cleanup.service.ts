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
    await this.runCleanup();
  }

  // Every day at 03:00
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleDailyCleanup() {
    await this.runCleanup();
  }

  private async runCleanup() {
    try {
      const deleted = await this.sessionsService.cleanupExpiredSessions(10);
      if (deleted > 0) {
        this.logger.log(`Deleted ${deleted} stale session(s)`);
      }
    } catch (error) {
      this.logger.error('Session cleanup failed', error as Error);
    }
  }
}
