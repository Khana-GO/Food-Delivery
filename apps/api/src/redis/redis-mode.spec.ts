/**
 * ERR-021 regression tests — production must not silently fall back to
 * per-process session revocation / rate limiting.
 */
import { resolveRedisMode } from './redis-mode';

function config(env: Record<string, string | undefined>) {
  return {
    get: (key: string, defaultValue?: string) => env[key] ?? defaultValue,
  } as any;
}

describe('resolveRedisMode (ERR-021)', () => {
  it('uses Redis when REDIS_ENABLED=true', () => {
    expect(
      resolveRedisMode(
        config({ REDIS_ENABLED: 'true', NODE_ENV: 'production' }),
      ),
    ).toBe('redis');
  });

  it('refuses to boot in production without Redis', () => {
    expect(() =>
      resolveRedisMode(
        config({ REDIS_ENABLED: 'false', NODE_ENV: 'production' }),
      ),
    ).toThrow(/REDIS_ENABLED is false in production/);
  });

  it('allows an explicit in-memory opt-in in production', () => {
    expect(
      resolveRedisMode(
        config({
          REDIS_ENABLED: 'false',
          NODE_ENV: 'production',
          ALLOW_IN_MEMORY_SESSIONS: 'true',
        }),
      ),
    ).toBe('memory');
  });

  it('keeps the in-memory fallback for development', () => {
    expect(
      resolveRedisMode(
        config({ REDIS_ENABLED: 'false', NODE_ENV: 'development' }),
      ),
    ).toBe('memory');
    expect(resolveRedisMode(config({ NODE_ENV: 'development' }))).toBe(
      'memory',
    );
  });
});
