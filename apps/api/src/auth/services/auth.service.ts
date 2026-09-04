import {
  BadRequestException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
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
import { SessionsService } from '../../sessions/sessions.service';
import { Inject } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../../db/database.constants';
import * as schema from '../../db/schema';
import { usersTable } from '../../db/schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';
import { NotificationsService } from '../../notification/notification.service';
import axios from 'axios';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly sessionService: SessionsService,
    private readonly notificationsService: NotificationsService,
    @Inject(DATABASE) private readonly db: NeonDatabase<typeof schema>,
  ) {}

  public readonly logger = new Logger(AuthService.name);

  async register(dto: RegisterUserDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already registered');
    }

    const normalizedPhone = dto.phone?.trim();
    if (!normalizedPhone) {
      throw new BadRequestException('Phone number is required');
    }

    if (this.db?.query?.usersTable) {
      const existingPhone = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.phone, normalizedPhone),
      });

      if (existingPhone) {
        throw new BadRequestException('Phone number already registered');
      }
    }

    const otp = this.generateOtp();
    const user = await this.db.transaction(async (tx) => {
      const createdUser = await this.usersService.create(
        {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName.trim(),
          email,
          password: dto.password,
          phone: normalizedPhone,
          verificationToken: this.hashToken(otp),
          verificationTokenExpiry: this.expiryInMinutes(10),
          isVerified: false,
        },
        tx,
      );

      await this.mailService.sendVerificationCode(createdUser.email, otp);
      return createdUser;
    });

    // Welcome notification after commit (outside transaction) – FK now valid
    await this.notificationsService
      .create({
        userId: user.id,
        type: 'profile',
        title: 'Welcome to KhanaGo!',
        body: `Your account has been created as ${user.role}.`,
        data: { role: user.role },
      })
      .catch((err) =>
        this.logger.warn(
          `Failed to create welcome notification: ${err?.message}`,
        ),
      );

    return {
      message: 'Check your email for a verification code',
      email: user.email,
    };
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
    const user = await this.usersService.findByEmail(
      email.trim().toLowerCase(),
    );
    if (!user || user.isVerified) {
      return { message: 'If the account exists, a new code has been sent' };
    }

    // 60s cooldown
    if (
      user.verificationLastSentAt &&
      Date.now() - user.verificationLastSentAt.getTime() < 60_000
    ) {
      throw new BadRequestException(
        'Please wait before requesting another code',
      );
    }

    const otp = this.generateOtp();
    await this.usersService.setVerificationToken(
      user.id,
      this.hashToken(otp),
      this.expiryInMinutes(10),
    );
    await this.mailService.sendVerificationCode(user.email, otp);
    return { message: 'If the account exists, a new code has been sent' };
  }

  // backend/src/auth/auth.service.ts
  // auth.service.ts
  async login(dto: LoginUserDto) {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'No account found with this email. Please register first.',
      );
    }

    if (
      !user.password ||
      !(await bcrypt.compare(dto.password, user.password))
    ) {
      throw new UnauthorizedException(
        'Invalid email or password. Please try again.',
      );
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'Please verify your email address before logging in. Check your inbox for the verification code.',
      );
    }

    await this.usersService.recordLogin(user.id);
    return this.authResponse(user);
  }

  async refreshToken(
    refreshToken: string,
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
        jti?: string;
      }>(refreshToken);
      if (payload.type !== 'refresh' || !payload.sub || !payload.jti)
        throw new Error('Invalid token type');

      const session = await this.sessionService.findValidByIdAndToken(
        payload.jti,
        refreshToken,
      );
      if (!session) throw new Error('Session revoked or expired');

      const user = await this.usersService.findById(payload.sub);
      if (!user || user.deletedAt || !user.isVerified)
        throw new Error('User unavailable');

      // rotate: kill old session, issue new one — prevents stolen refresh tokens from being reused indefinitely
      await this.sessionService.revoke(session.id);
      return this.authResponse(user, meta);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  // auth.service.ts
  async verifyGoogleToken(idToken: string): Promise<any> {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`,
        { timeout: 5000 },
      );

      const data = response.data;

      // Verify audience matches your client ID
      if (data.aud !== this.configService.get('GOOGLE_CLIENT_ID')) {
        throw new UnauthorizedException('Invalid token audience');
      }

      // Verify email is verified
      if (!data.email_verified) {
        throw new UnauthorizedException('Email not verified');
      }

      return {
        email: data.email,
        firstName: data.given_name,
        lastName: data.family_name,
        picture: data.picture,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      this.logger.error(`Google token verification failed: ${message}`);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  // apps/api/src/auth/services/auth.service.ts

  // ─── GOOGLE AUTH ───
  async googleLogin(googleUser: {
    email: string;
    firstName: string;
    lastName: string;
    picture?: string;
  }): Promise<{ accessToken: string; refreshToken: string; user: any }> {
    // ─── Find user by email ───
    let user = await this.usersService.findByEmail(googleUser.email);

    if (!user) {
      // ─── Create new user ───
      const hashedPassword = await bcrypt.hash(
        crypto.randomUUID() + crypto.randomBytes(8).toString('hex'),
        this.saltRounds(),
      );

      user = await this.usersService.create({
        firstName: googleUser.firstName || 'Google',
        lastName: googleUser.lastName || 'User',
        email: googleUser.email,
        password: hashedPassword,
        isVerified: true, // Google accounts are trusted
        phone: null,
        imageUrl: googleUser.picture,
        role: 'CUSTOMER', // Default role
      });

      this.logger.log(`Google user created: ${user.email}`);
    } else {
      // ─── Update picture if changed ───
      const updates: {
        imageUrl?: string;
        isVerified?: boolean;
        verifiedAt?: Date;
      } = {};
      if (googleUser.picture && !user.imageUrl) {
        updates.imageUrl = googleUser.picture;
      }
      // Google verified the user's email — mark the account verified so they
      // aren't blocked by email-verification checks on future logins.
      if (!user.isVerified) {
        updates.isVerified = true;
        updates.verifiedAt = new Date();
      }

      if (Object.keys(updates).length > 0) {
        await this.usersService.update(user.id, updates);
        user = await this.usersService.findById(user.id);
      }
    }

    // ─── Generate tokens ───
    if (!user) {
      throw new UnauthorizedException('Failed to resolve Google user');
    }
    return this.authResponse(user);
  }

  async logout(refreshToken: string, accessToken?: string) {
    const revokeToken = async (token: string, userId?: string) => {
      if (!token) return;

      try {
        const payload = await this.jwtService.verifyAsync<{ sub?: string }>(
          token,
        );
        this.sessionService.revokeToken?.(token, payload.sub);
      } catch {
        this.sessionService.revokeToken?.(token, userId);
      }
    };

    if (refreshToken) {
      try {
        const payload = await this.jwtService.verifyAsync<{
          sub: string;
          type?: string;
          jti?: string;
        }>(refreshToken);

        if (payload.type === 'refresh' && payload.jti) {
          if (typeof this.sessionService.revoke === 'function') {
            const removed = await this.sessionService.revoke(payload.jti);
            if (removed === 0) {
              await this.sessionService.revokeByToken?.(refreshToken);
            }
          } else {
            await this.sessionService.revokeByToken?.(refreshToken);
          }
          this.sessionService.revokeToken?.(refreshToken, payload.sub);
        } else if (payload.sub) {
          if (typeof this.sessionService.revokeAllForUser === 'function') {
            const removed = await this.sessionService.revokeAllForUser(
              payload.sub,
            );
            if (removed === 0) {
              await this.sessionService.revokeByToken?.(refreshToken);
            }
          } else {
            await this.sessionService.revokeByToken?.(refreshToken);
          }
          this.sessionService.revokeToken?.(refreshToken, payload.sub);
        }
      } catch {
        await this.sessionService.revokeByToken?.(refreshToken);
        this.sessionService.revokeToken?.(refreshToken);
      }
    }

    if (accessToken) {
      await revokeToken(accessToken);
    }

    return { message: 'Logged out successfully' };
  }

  async logoutAllDevices(userId: string) {
    await this.sessionService.revokeAllForUser(userId);
    return { message: 'Logged out from all devices' };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (user) {
      if (
        user.resetLastSentAt &&
        Date.now() - user.resetLastSentAt.getTime() < 60_000
      ) {
        return { message: 'If the email exists, a code has been sent' };
      }
      const otp = this.generateOtp();
      await this.usersService.setResetToken(
        user.id,
        this.hashToken(otp),
        this.expiryInMinutes(10),
      );
      await this.mailService.sendPasswordResetCode(user.email, otp);
    }
    return { message: 'If the email exists, a code has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );
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

    await this.usersService.updatePassword(
      user.id,
      await bcrypt.hash(dto.newPassword, this.saltRounds()),
    );
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
    const msPerUnit: Record<string, number> = {
      s: 1000,
      m: 60_000,
      h: 3_600_000,
      d: 86_400_000,
    };
    return new Date(Date.now() + value * msPerUnit[unit]);
  }

  private async authResponse(
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      phone?: string | null;
      imageUrl?: string | null;
      imagePublicId?: string | null;
      isVerified?: boolean;
      isOnline?: boolean;
      createdAt?: Date | string | null;
    },
    meta?: { userAgent?: string; ipAddress?: string },
  ) {
    const sessionId = crypto.randomUUID();

    const accessExpiresIn =
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '15m';
    const refreshExpiresIn =
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d';

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
      sessionId,
    );

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: (user as any).phone ?? null,
        imageUrl: (user as any).imageUrl ?? null,
        imagePublicId: (user as any).imagePublicId ?? null,
        isVerified: (user as any).isVerified ?? false,
        isOnline: (user as any).isOnline ?? false,
        createdAt: (user as any).createdAt ?? new Date(),
      },
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
    return Number.isInteger(rounds) && rounds >= 10 && rounds <= 15
      ? rounds
      : 12;
  }

  async verifyResetCode(dto: { email: string; code: string }) {
    const user = await this.usersService.findByEmail(
      dto.email.trim().toLowerCase(),
    );
    if (!user || user.resetAttempts >= 5)
      throw new BadRequestException('Invalid or expired code');

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
  async resetPasswordWithSession(
    resetSessionToken: string,
    newPassword: string,
  ) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
      }>(resetSessionToken);
      if (payload.type !== 'reset-session') throw new Error();
      await this.usersService.updatePassword(
        payload.sub,
        await bcrypt.hash(newPassword, this.saltRounds()),
      );
      await this.usersService.clearResetToken(payload.sub);
      return { message: 'Password reset successfully' };
    } catch {
      throw new UnauthorizedException(
        'Invalid or expired session, please verify your code again',
      );
    }
  }
}
