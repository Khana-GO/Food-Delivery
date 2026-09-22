import type { ConfigService } from '@nestjs/config';

export type RedisMode = 'redis' | 'memory';

/**
 * Decide whether the app may run against real Redis or the in-memory fallback.
 *
 * Token revocation and rate limiting are only durable/shared with a real Redis.
 * In production the in-memory fallback would silently let revoked tokens work
 * again after a restart (or on another instance), so it is refused unless the
 * operator opts in with ALLOW_IN_MEMORY_SESSIONS=true.
 */
export function resolveRedisMode(configService: ConfigService): RedisMode {
  const enabled =
    configService.get<string>('REDIS_ENABLED', 'false') === 'true';
  if (enabled) return 'redis';

  const isProduction = configService.get<string>('NODE_ENV') === 'production';
  const allowInMemory =
    configService.get<string>('ALLOW_IN_MEMORY_SESSIONS') === 'true';

  if (isProduction && !allowInMemory) {
    throw new Error(
      'REDIS_ENABLED is false in production. Session revocation and rate limiting ' +
        'would be per-process only. Set REDIS_ENABLED=true (recommended) or set ' +
        'ALLOW_IN_MEMORY_SESSIONS=true to accept the risk explicitly.',
    );
  }

  return 'memory';
}
