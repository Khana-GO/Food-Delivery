import { BadRequestException, Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../../users/users.service';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register.dto';
import { VerifyOtpDto } from '../dto/verify-otp.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterUserDto) {
    const phone = dto.phone.trim();
    if (await this.usersService.findByPhone(phone)) {
      throw new BadRequestException('Phone number already registered');
    }

    const user = await this.usersService.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      phone,
      isVerified: false,
    });

    const otp = this.generateOtp();
    await this.usersService.setOtp(user.id, otp, this.expiryInMinutes(10));
    
    // Simulating SMS sending
    this.logger.log(`\n\n========================\n[DEV] OTP for ${phone} is: ${otp}\n========================\n`);

    return { message: 'OTP sent to your phone' };
  }

  async login(dto: LoginUserDto) {
    const phone = dto.phone.trim();
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('Phone number not registered');
    }

    const otp = this.generateOtp();
    await this.usersService.setOtp(user.id, otp, this.expiryInMinutes(10));

    // Simulating SMS sending
    this.logger.log(`\n\n========================\n[DEV] OTP for ${phone} is: ${otp}\n========================\n`);

    return { message: 'OTP sent to your phone' };
  }

  async verifyOtp(dto: VerifyOtpDto) {
    const phone = dto.phone.trim();
    const user = await this.usersService.findByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.otpCode !== dto.otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.otpExpiry || user.otpExpiry <= new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.usersService.verifyAndClearOtp(user.id);
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

  private authResponse(user: { id: string; role: string; firstName: string; lastName: string; phone?: string | null }) {
    const payload = { sub: user.id, phone: user.phone, role: user.role };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h' } as never),
      refreshToken: this.jwtService.sign({ sub: user.id, type: 'refresh' }, { expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d' } as never),
      user: { id: user.id, phone: user.phone, role: user.role, firstName: user.firstName, lastName: user.lastName },
    };
  }

  private generateOtp() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP
  }

  private expiryInMinutes(minutes: number) {
    return new Date(Date.now() + minutes * 60 * 1000);
  }
}
