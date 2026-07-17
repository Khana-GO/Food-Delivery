import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';
import { DATABASE } from '../../db/database.constants';
import { usersTable } from '../../db/schema/user.schema';
import { LoginUserDto } from '../dto/login.dto';
import { RegisterUserDto } from '../dto/register.dto';
import type { AuthResponse, AuthUserPayload } from '../interfaces/auth-response.interface';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: any,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterUserDto): Promise<AuthResponse> {
    const existingUser = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new BadRequestException('Email already registered');
    }

    const saltRounds = Number(this.configService.get<string>('SALT_ROUNDS')) || 10;

    const hashedPassword = await bcrypt.hash(dto.password, saltRounds);

    const [createdUser] = await this.db
      .insert(usersTable)
      .values({
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        password: hashedPassword,
        phone: dto.phone,
      })
      .returning();

    return this.buildAuthResponse(createdUser);
  }

  async login(dto: LoginUserDto): Promise<AuthResponse> {
    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, dto.email))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResponse(user);
  }

  async refreshToken(refreshToken: string): Promise<Pick<AuthResponse, 'accessToken' | 'refreshToken'>> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    let payload: JwtPayload;
    try {
      payload = verify(refreshToken, secret) as JwtPayload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const [user] = await this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, payload.sub))
      .limit(1);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const accessToken = this.signToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
    );

    const newRefreshToken = this.signToken(
      {
        sub: user.id,
        type: 'refresh',
      },
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  private buildAuthResponse(user: AuthUserPayload): AuthResponse {
    const accessToken = this.signToken(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      this.configService.get<string>('JWT_EXPIRES_IN') ?? '1h',
    );

    const refreshToken = this.signToken(
      {
        sub: user.id,
        type: 'refresh',
      },
      this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
    );

    const { password, ...sanitizedUser } = user;

    return {
      accessToken,
      refreshToken,
      user: sanitizedUser,
    };
  }

  private signToken(payload: Record<string, unknown>, expiresIn: string): string {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new Error('JWT_SECRET is not configured');
    }

    return this.jwtService.sign(payload, {
      secret,
      expiresIn: expiresIn as never,
    });
  }
}
