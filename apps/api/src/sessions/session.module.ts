// src/sessions/sessions.module.ts
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SessionsService } from './sessions.service';
import { SessionCleanupService } from './session-cleanup.service';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [SessionsService, SessionCleanupService],
  exports: [SessionsService], // ← this is the important part
})
export class SessionsModule {}
