import { Module } from '@nestjs/common';
import { CategoriesController } from './menu-categories.controller';
import { CategoriesService } from './menu-categories.service';
import { SessionsModule } from '../sessions/session.module';

// SessionsModule is required so JwtAuthGuard (which injects SessionsService
// for revoked-token checks) can resolve inside this module's context.
@Module({
  controllers: [CategoriesController],
  imports: [SessionsModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
