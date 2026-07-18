import { Module } from '@nestjs/common';
import { AuthController } from './controllers/auth.controller';
import { ProtectedController } from './controllers/protected.controller';
import { RefreshController } from './controllers/refresh.controller';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { AuthService } from './services/auth.service';

@Module({
  controllers: [AuthController, RefreshController, ProtectedController],
  providers: [AuthService, JwtAuthGuard, RolesGuard],
  exports: [AuthService],
})
export class AuthModule {}
