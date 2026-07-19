import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailService } from '../../mail/mail.service';
import { UsersService } from '../../users/users.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { ResendVerificationDto } from '../dto/resend-verification-code.dto';
import { SessionsService } from '../../sessions/sessions.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionsService
  ) {}

async register(dto: RegisterUserDto) {
  const email = dto.email.trim().toLowerCase();
  if (await this.usersService.findByEmail(email)) {
    throw new BadRequestException('Email already registered');
  }

  const otp = this.generateOtp();
  const user = await this.usersService.create({
    firstName: dto.firstName.trim(),
    lastName: dto.lastName.trim(),
    email,
    password: await bcrypt.hash(dto.password, this.saltRounds()),
    phone: dto.phone?.trim(),
    verificationToken: this.hashToken(otp),
    verificationTokenExpiry: this.expiryInMinutes(10),
    isVerified: false,
  });

  await this.mailService.sendVerificationCode(user.email, otp);
  return { message: 'Check your email for a verification code', email: user.email };
}

async verifyEmail(dto: VerifyEmailDto) {
  const email = dto.email.trim().toLowerCase();
  const user = await this.usersService.findByEmail(email);

  // don't leak existence; but since register already confirms it, this is fine
  if (!user || user.isVerified) {
    throw new BadRequestException('Invalid or expired code');
  }

  if (user.verificationAttempts >= 5) {
    throw new BadRequestException('Too many attempts. Request a new code.');
  }

  const isValid =
    user.verificationToken === this.hashToken(dto.code) &&
    user.verificationTokenExpiry &&
    user.verificationTokenExpiry > new Date();

  if (!isValid) {
    await this.usersService.incrementVerificationAttempts(user.id);
    throw new BadRequestException('Invalid or expired code');
  }

  await this.usersService.markAsVerified(user.id);
  return { message: 'Email verified successfully' };
}

async resendVerificationCode(email: string) {
  const user = await this.usersService.findByEmail(email.trim().toLowerCase());
  if (!user || user.isVerified) {
    return { message: 'If the account exists, a new code has been sent' };
  }

  // 60s cooldown
  if (user.verificationLastSentAt && Date.now() - user.verificationLastSentAt.getTime() < 60_000) {
    throw new BadRequestException('Please wait before requesting another code');
  }

  const otp = this.generateOtp();
  await this.usersService.setResetToken(user.id, this.hashToken(otp), this.expiryInMinutes(10));
  await this.mailService.sendVerificationCode(user.email, otp);
  return { message: 'If the account exists, a new code has been sent' };
}



  async login(dto: LoginUserDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user?.password || !(await bcrypt.compare(dto.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    await this.usersService.recordLogin(user.id);
    return this.authResponse(user);
  }




async refreshToken(refreshToken: string, meta?: { userAgent?: string; ipAddress?: string }) {
  try {
    const payload = await this.jwtService.verifyAsync<{ sub: string; type?: string; jti?: string }>(refreshToken);
    if (payload.type !== 'refresh' || !payload.sub || !payload.jti) throw new Error('Invalid token type');

    const session = await this.sessionService.findValidByIdAndToken(payload.jti, refreshToken);
    if (!session) throw new Error('Session revoked or expired');

    const user = await this.usersService.findById(payload.sub);
    if (!user || user.deletedAt || !user.isVerified) throw new Error('User unavailable');

    // rotate: kill old session, issue new one — prevents stolen refresh tokens from being reused indefinitely
    await this.sessionService.revoke(session.id);
    return this.authResponse(user, meta);
  } catch {
    throw new UnauthorizedException('Invalid or expired refresh token');
  }
}


async logout(refreshToken: string) {
  try {
    const payload = await this.jwtService.verifyAsync<{ sub: string; type?: string; jti?: string }>(refreshToken);
    if (payload.type === 'refresh' && payload.jti) {
      await this.sessionService.revoke(payload.jti);
    }
  } catch {
    // token invalid/expired anyway — nothing to revoke, don't error out
  }
  return { message: 'Logged out successfully' };
}

async logoutAllDevices(userId: string) {
  await this.sessionService.revokeAllForUser(userId);
  return { message: 'Logged out from all devices' };
}

async forgotPassword(dto: ForgotPasswordDto) {
  const user = await this.usersService.findByEmail(dto.email.trim().toLowerCase());
  if (user) {
    if (user.resetLastSentAt && Date.now() - user.resetLastSentAt.getTime() < 60_000) {
      return { message: 'If the email exists, a code has been sent' };
    }
    const otp = this.generateOtp();
    await this.usersService.setResetToken(user.id, this.hashToken(otp), this.expiryInMinutes(10));
    await this.mailService.sendPasswordResetCode(user.email, otp);
  }
  return { message: 'If the email exists, a code has been sent' };
}

async resetPassword(dto: ResetPasswordDto) {
  const user = await this.usersService.findByEmail(dto.email.trim().toLowerCase());
  if (!user || user.resetAttempts >= 5) {
    throw new BadRequestException('Invalid or expired code');
  }

  const isValid =
    user.resetToken === this.hashToken(dto.code) &&
    user.resetTokenExpiry &&
    user.resetTokenExpiry > new Date();

  if (!isValid) {
    await this.usersService.incrementResetAttempts(user.id);
    throw new BadRequestException('Invalid or expired code');
  }

  await this.usersService.updatePassword(user.id, await bcrypt.hash(dto.newPassword, this.saltRounds()));
  await this.usersService.clearResetToken(user.id); // invalidate so it can't be reused
  return { message: 'Password reset successfully' };
}

private parseExpiryToDate(duration: string): Date {
  const match = duration.match(/^(\d+)([smhd])$/);
  if (!match) {
    // fallback if the env value is malformed/unexpected
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }
  const value = Number(match[1]);
  const unit = match[2];
  const msPerUnit: Record<string, number> = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return new Date(Date.now() + value * msPerUnit[unit]);
}

private async authResponse(
  user: { id: string; email: string; role: string; firstName: string; lastName: string },
  meta?: { userAgent?: string; ipAddress?: string },
) {
  const sessionId = crypto.randomUUID();

  const accessExpiresIn = this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
  const refreshExpiresIn = this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

  const accessToken = this.jwtService.sign(
    { sub: user.id, email: user.email, role: user.role },
    { expiresIn: accessExpiresIn } as never,
  );

  const refreshToken = this.jwtService.sign(
    { sub: user.id, type: 'refresh', jti: sessionId },
    { expiresIn: refreshExpiresIn } as never,
  );

  await this.sessionService.create(
    user.id,
    refreshToken,
    this.parseExpiryToDate(refreshExpiresIn),
    meta,
  );

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
  };
}
private generateOtp(): string {
  // 6-digit numeric, zero-padded, cryptographically random
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
} 


private expiryInDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}


private hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}


  private expiryInMinutes(minutes: number) {
  return new Date(Date.now() + minutes * 60 * 1000);
}


  private saltRounds() {
    const rounds = Number(this.configService.get<string>('SALT_ROUNDS') ?? 12);
    return Number.isInteger(rounds) && rounds >= 10 && rounds <= 15 ? rounds : 12;
  }


  async verifyResetCode(dto: { email: string; code: string }) {
  const user = await this.usersService.findByEmail(dto.email.trim().toLowerCase());
  if (!user || user.resetAttempts >= 5) throw new BadRequestException('Invalid or expired code');

  const isValid =
    user.resetToken === this.hashToken(dto.code) &&
    user.resetTokenExpiry &&
    user.resetTokenExpiry > new Date();

  if (!isValid) {
    await this.usersService.incrementResetAttempts(user.id);
    throw new BadRequestException('Invalid or expired code');
  }

  // issue a short-lived reset session JWT, separate signing secret/purpose
  const resetSessionToken = this.jwtService.sign(
    { sub: user.id, type: 'reset-session' },
    { expiresIn: '5m' } as never,
  );
  return { resetSessionToken };
}

async resetPasswordWithSession(resetSessionToken: string, newPassword: string) {
  try {
    const payload = await this.jwtService.verifyAsync<{ sub: string; type?: string }>(resetSessionToken);
    if (payload.type !== 'reset-session') throw new Error();
    await this.usersService.updatePassword(payload.sub, await bcrypt.hash(newPassword, this.saltRounds()));
    await this.usersService.clearResetToken(payload.sub);
    return { message: 'Password reset successfully' };
  } catch {
    throw new UnauthorizedException('Invalid or expired session, please verify your code again');
  }
}


}
