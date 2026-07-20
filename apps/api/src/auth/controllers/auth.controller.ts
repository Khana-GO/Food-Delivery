import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../services/auth.service';
import { RegisterUserDto } from '../dto/register.dto';
import { LoginUserDto } from '../dto/login.dto';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification-code.dto';
import { Throttle } from '@nestjs/throttler';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { LogoutDto } from '../dto/logout.dto';


@Throttle({ default: { limit: 5, ttl: 60_000 } })  // 5 request in per minute from single ip
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  async register(@Body() dto: RegisterUserDto) {
    return this.authService.register(dto);
  }

  @Post('verify-email')
  @ApiOperation({ summary: 'Verify email address' })
  async verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Body() dto: LoginUserDto) {
    return this.authService.login(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // stricter: sends an email
  @Post('forgot-password')
  @ApiOperation({ summary: 'Request password reset' })
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Reset password with code' })
  async resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60_000 } }) // stricter: sends an email
  @Post('resend-verification-code')
  @ApiOperation({ summary: 'Resend email verification code' })
  async resendVerificationCode(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerificationCode(dto.email);
  }

// logout for single device
@Post('logout')
@ApiOperation({ summary: 'Logout current device/session' })
async logout(@Body() dto: LogoutDto, @Req() req: { headers?: Record<string, string | undefined> } | string | undefined) {
  const authorizationHeader = typeof req === 'string' ? req : req?.headers?.authorization;
  const refreshToken = dto?.refreshToken || this.extractBearerToken(authorizationHeader);
  return this.authService.logout(refreshToken);
}

@UseGuards(JwtAuthGuard)
@Post('logout-all')
@ApiOperation({ summary: 'Logout from all devices' })
async logoutAllDevices(@CurrentUser() user: { sub: string }) {
  return this.authService.logoutAllDevices(user.sub); // ← sub, not id
}

private extractBearerToken(authorization?: string): string {
  if (!authorization) {
    return '';
  }

  const [type, token] = authorization.split(' ');
  return type === 'Bearer' && token ? token : '';
}

}