import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { SessionsModule } from '../sessions/session.module';

// SessionsModule is required so JwtAuthGuard (which injects SessionsService
// for revoked-token checks) can resolve inside this module's context.
@Module({
  imports: [SessionsModule],
  controllers: [CartController],
  providers: [CartService],
})
export class CartModule {}
