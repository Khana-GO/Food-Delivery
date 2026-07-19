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

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterUserDto) {
    const email = dto.email.trim().toLowerCase();
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already registered');
    }

    const token = this.generateToken();
    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      password: await bcrypt.hash(dto.password, this.saltRounds()),
      phone: dto.phone?.trim(),
      verificationToken: this.hashToken(token),
      verificationTokenExpiry: this.expiryInHours(24),
      isVerified: false,
    });

    await this.mailService.sendVerificationEmail(user.email, token);
    return { message: 'Check your email to verify your account' };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const user = await this.usersService.findByVerificationTokenHash(this.hashToken(dto.token));
    if (!user || !user.verificationTokenExpiry || user.verificationTokenExpiry <= new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.usersService.markAsVerified(user.id);
    return { message: 'Email verified successfully' };
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

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string; type?: string }>(refreshToken);
      if (payload.type !== 'refresh' || !payload.sub) throw new Error('Invalid token type');
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.deletedAt || !user.isVerified) throw new Error('User unavailable');
      return this.authResponse(user);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      const token = this.generateToken();
      await this.usersService.setResetToken(user.id, this.hashToken(token), this.expiryInHours(1));
      await this.mailService.sendPasswordResetEmail(user.email, token);
    }
    return { message: 'If the email exists, a reset link has been sent' };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.usersService.findByResetTokenHash(this.hashToken(dto.token));
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry <= new Date()) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.usersService.updatePassword(user.id, await bcrypt.hash(dto.newPassword, this.saltRounds()));
    return { message: 'Password reset successfully' };
  }

  private authResponse(user: { id: string; email: string; role: string; firstName: string; lastName: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h' } as never),
      refreshToken: this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d' } as never),
      user: { id: user.id, email: user.email, role: user.role, firstName: user.firstName, lastName: user.lastName },
    };
  }

  private generateToken() { return crypto.randomBytes(32).toString('hex'); }
  private hashToken(token: string) { return crypto.createHash('sha256').update(token).digest('hex'); }
  private expiryInHours(hours: number) { return new Date(Date.now() + hours * 60 * 60 * 1000); }
  private saltRounds() {
    const rounds = Number(this.configService.get<string>('SALT_ROUNDS') ?? 12);
    return Number.isInteger(rounds) && rounds >= 10 && rounds <= 15 ? rounds : 12;
  }
}
