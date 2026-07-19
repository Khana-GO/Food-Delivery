import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { MailModule } from '../mail/mail.module';
import { AuthController } from './controllers/auth.controller';
import { ProtectedController } from './controllers/protected.controller';
import { RefreshController } from './controllers/refresh.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [
    UsersModule,
    MailModule,
    SessionsModule
  ],
  controllers: [AuthController, RefreshController, ProtectedController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}
