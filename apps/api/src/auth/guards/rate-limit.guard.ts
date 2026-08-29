import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import Redis from 'ioredis';
import type { Request, Response } from 'express';

/**
 * Professional Redis-backed fixed-window rate limiter.
 * - Atomic INCR+EXPIRE via Lua (no race / no orphan keys)
 * - Trust-proxy aware IP extraction, normalized route key (path without query)
 * - Fail-open: Redis down → allow request but warn
 * - Sets X-RateLimit-* headers for observability
 */
@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);

  // Lua: INCR + EXPIRE atomically (avoid two round-trips + TTL drift)
  private static readonly LUA = `
    local c = redis.call('INCR', KEYS[1])
    if c == 1 then
      redis.call('EXPIRE', KEYS[1], ARGV[1])
    end
    return c
  `;

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const ip = this.getClientIp(request);
    const route = this.getRouteKey(request);
    const key = `rate-limit:${ip}:${route}`;

    const { limit, windowSec } = this.resolveBucket(route);

    let current: number;
    try {
      // Atomic: INCR+EXPIRE in single EVAL
      const res = (await this.redis.eval(
        RateLimitGuard.LUA,
        1,
        key,
        String(windowSec),
      )) as number;
      current = Number(res);
    } catch (err) {
      // Fail-open — don't block users when Redis is down
      this.logger.warn(
        `RateLimit Redis error (fail-open) for ${key}: ${(err as Error).message}`,
      );
      return true;
    }

    // Remaining + reset headers
    let ttl = windowSec;
    try {
      const t = await this.redis.ttl(key);
      if (t > 0) ttl = t;
    } catch {
      /* empty */
    }

    const remaining = Math.max(0, limit - current);
    try {
      response.setHeader('X-RateLimit-Limit', String(limit));
      response.setHeader('X-RateLimit-Remaining', String(remaining));
      response.setHeader(
        'X-RateLimit-Reset',
        String(Math.ceil(Date.now() / 1000 + ttl)),
      );
    } catch {
      /* empty */
    }

    if (current > limit) {
      try {
        response.setHeader('Retry-After', String(ttl));
      } catch {
        /* empty */
      }
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          error: 'Too Many Requests',
          message: `You have exceeded the limit of ${limit} requests per ${windowSec} seconds. Retry after ${ttl}s.`,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private resolveBucket(route: string): { limit: number; windowSec: number } {
    // Order matters: most specific first
    if (route.includes('/auth/login')) return { limit: 5, windowSec: 60 };
    if (route.includes('/auth/register')) return { limit: 3, windowSec: 60 };
    if (route.includes('/auth/forgot-password'))
      return { limit: 3, windowSec: 60 };
    if (route.includes('/auth/resend-verification'))
      return { limit: 3, windowSec: 60 };
    if (route.includes('/orders')) return { limit: 50, windowSec: 60 };
    return { limit: 100, windowSec: 60 };
  }

  private getClientIp(req: Request): string {
    const xff = (req.headers['x-forwarded-for'] as string | undefined)
      ?.split(',')[0]
      ?.trim();
    if (xff) return xff;
    const realIp = req.headers['x-real-ip'] as string | undefined;
    if (realIp) return realIp;
    // Express populates req.ip when trust proxy is set; fallback to socket
    const ip = (req as unknown as { ip?: string }).ip;
    if (ip) return ip;
    const conn = (req as unknown as { connection?: { remoteAddress?: string } })
      .connection?.remoteAddress;
    return conn || 'unknown';
  }

  private getRouteKey(req: Request): string {
    // Prefer matched route path (without query/host), fallback to pathname
    const routePath: string | undefined =
      (req as unknown as { route?: { path?: string } }).route?.path ||
      (req as unknown as { originalUrl?: string }).originalUrl ||
      req.url;
    if (!routePath) return 'unknown';
    // Strip query string and normalize
    const pathname = routePath.split('?')[0].split('#')[0];
    // Collapse dynamic segments: /restaurants/<uuid> -> /restaurants/:id  (prevents key explosion)
    return pathname
      .replace(/\/[0-9a-fA-F-]{36}\b/g, '/:id')
      .replace(/\/\d+\b/g, '/:id');
  }
}
