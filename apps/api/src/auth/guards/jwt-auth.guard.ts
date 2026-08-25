import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { SessionsService } from '../../sessions/sessions.service';

// ===============================
// Constants
// ===============================

export const IS_PUBLIC_KEY = 'isPublic';

// ===============================
// Guard
// ===============================

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
    private readonly sessionsService: SessionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    //  Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    //  Skip authentication for public routes
    if (isPublic) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: JwtPayload }>();
    // console.log('Request headers:', request.headers); // Log the request headers for debugging
    const authHeader = request.headers.authorization;

    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Missing bearer token');
    }

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Invalid bearer token');
    }

    let payload: JwtPayload;
    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (payload.type === 'refresh') {
      throw new UnauthorizedException(
        'Refresh tokens cannot access protected routes',
      );
    }

    if (
      this.sessionsService.isTokenRevoked(token, {
        userId: payload.sub,
        issuedAtSeconds: payload.iat,
      })
    ) {
      throw new UnauthorizedException(
        'Session was revoked. Please log in again.',
      );
    }

    request.user = payload;
    return true;
  }
}
