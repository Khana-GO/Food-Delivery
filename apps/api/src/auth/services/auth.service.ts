import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../users/users.service';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';
import { SocialLoginDto, SocialProvider } from '../dto/social-login.dto';
import { MailService } from '../../mail/mail.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
  ) {}

  async register(dto: RegisterUserDto) {
    const phone = dto.phone.trim();
    const email = dto.email.trim().toLowerCase();

    if (await this.usersService.findByPhone(phone)) {
      throw new BadRequestException('Phone number already registered');
    }
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email address already registered');
    }

    const hashedPassword = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      phone,
      password: hashedPassword,
      isVerified: false,
    });

    const otp = this.generateOtp();
    await this.usersService.setOtp(user.id, otp, this.expiryInMinutes(10));

    // Send OTP to the user's email
    await this.mailService.sendOtpEmail(email, otp, dto.firstName.trim());
    this.logger.log(`OTP sent to ${email} for phone ${phone}`);

    return { message: 'Verification OTP sent to your email', phone: user.phone, email: user.email };
  }

  async login(dto: LoginUserDto) {
    let user: Awaited<ReturnType<typeof this.usersService.findByPhone>> = undefined;

    if (dto.email) {
      user = await this.usersService.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.usersService.findByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (dto.password && user.password) {
      const isMatch = await bcrypt.compare(dto.password, user.password);
      if (!isMatch) {
        throw new UnauthorizedException('Invalid credentials');
      }
    }

    if (!user.isVerified) {
      const otp = this.generateOtp();
      await this.usersService.setOtp(user.id, otp, this.expiryInMinutes(10));
      if (user.email) {
        await this.mailService.sendOtpEmail(user.email, otp, user.firstName);
      }
      return {
        requiresVerification: true,
        message: 'Account not verified. OTP sent to your email.',
        phone: user.phone,
        email: user.email,
      };
    }

    await this.usersService.recordLogin(user.id);
    return this.authResponse(user);
  }

  async verifyOtp(dto: VerifyOtpDto) {
    let user: Awaited<ReturnType<typeof this.usersService.findByPhone>> = undefined;

    if (dto.email) {
      user = await this.usersService.findByEmail(dto.email);
    } else if (dto.phone) {
      user = await this.usersService.findByPhone(dto.phone);
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // CHECKER: Verify if OTP matches and isn't expired
    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP code. Please check and try again.');
    }

    if (!user.otpExpiry || new Date(user.otpExpiry) <= new Date()) {
      throw new BadRequestException('OTP has expired. Please request a new one.');
    }

    await this.usersService.verifyAndClearOtp(user.id);
    await this.usersService.recordLogin(user.id);

    return this.authResponse(user);
  }

  async socialLogin(dto: SocialLoginDto) {
    const email = dto.email.trim().toLowerCase();
    const providerId = dto.id.trim();
    const isGoogle = dto.provider === SocialProvider.GOOGLE;

    // 1. Check if user already exists by provider ID
    let user = isGoogle
      ? await this.usersService.findByGoogleId(providerId)
      : await this.usersService.findByFacebookId(providerId);

    // 2. If not found by social ID, check by email
    if (!user && email) {
      user = await this.usersService.findByEmail(email);
    }

    if (user) {
      // User exists — update social ID, photo, or verified status if needed
      const updates: Record<string, any> = {};
      if (isGoogle && !user.googleId) updates.googleId = providerId;
      if (!isGoogle && !user.facebookId) updates.facebookId = providerId;
      if (dto.imageUrl && !user.imageUrl) updates.imageUrl = dto.imageUrl;
      if (!user.isVerified) updates.isVerified = true;

      if (Object.keys(updates).length > 0) {
        user = await this.usersService.update(user.id, updates);
      }
    } else {
      // 3. Create new user from social profile
      user = await this.usersService.create({
        firstName: dto.firstName.trim(),
        lastName: dto.lastName?.trim() || '',
        email,
        googleId: isGoogle ? providerId : null,
        facebookId: !isGoogle ? providerId : null,
        authProvider: dto.provider,
        imageUrl: dto.imageUrl || null,
        isVerified: true,
        verifiedAt: new Date(),
      });
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

  private authResponse(user: { id: string; role: string; roles?: string[] | null; firstName: string; lastName: string; phone?: string | null }) {
    const payload = { sub: user.id, phone: user.phone, role: user.role, roles: user.roles || [user.role] };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h' } as never),
      refreshToken: this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d' } as never),
      user: { id: user.id, phone: user.phone, role: user.role, availableRoles: user.roles || [user.role], firstName: user.firstName, lastName: user.lastName },
    };
  }

  private generateOtp() {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  }

  private expiryInMinutes(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
