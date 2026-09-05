import { Module, forwardRef } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './controllers/auth.controller';
import { RefreshController } from './controllers/refresh.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { RateLimitGuard } from './guards/rate-limit.guard';
import { AuthService } from './services/auth.service';
import { SessionsModule } from '../sessions/session.module';
import { NotificationsModule } from '../notification/notification.module';
import { GoogleStrategy } from './strategies/google.strategy';
import { GoogleTokenService } from './services/google-token.service';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    MailModule,
    SessionsModule,
    NotificationsModule,
  ],
  controllers: [AuthController, RefreshController],
  providers: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
    GoogleStrategy,
    GoogleTokenService,
  ],
  exports: [
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    RateLimitGuard,
    GoogleTokenService,
  ],
})
export class AuthModule {}
