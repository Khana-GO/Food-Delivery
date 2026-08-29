import { Inject, Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  /** Get and JSON.parse. Returns null on miss or on Redis error (fail-open). */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (raw === null) return null;
      return JSON.parse(raw) as T;
    } catch (err) {
      this.logger.warn(
        `Cache GET failed for ${key}: ${(err as Error).message}`,
      );
      return null;
    }
  }

  /** JSON.stringify + SETEX. Fail-open on error. */
  async set(key: string, value: unknown, ttlSeconds: number): Promise<void> {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds > 0) {
        await this.redis.set(key, payload, 'EX', ttlSeconds);
      } else {
        await this.redis.set(key, payload);
      }
    } catch (err) {
      this.logger.warn(
        `Cache SET failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch (err) {
      this.logger.warn(
        `Cache DEL failed for ${key}: ${(err as Error).message}`,
      );
    }
  }

  async delMany(keys: string[]): Promise<void> {
    if (keys.length === 0) return;
    try {
      await this.redis.del(...keys);
    } catch (err) {
      this.logger.warn(`Cache DELMANY failed: ${(err as Error).message}`);
    }
  }

  /**
   * SCAN + UNLINK (non-blocking). Safe for production with large keyspace.
   * Use with care — pattern should be namespaced (e.g. "restaurant:*").
   */
  async delByPattern(pattern: string): Promise<void> {
    try {
      let cursor = '0';
      do {
        const [next, keys] = await this.redis.scan(
          cursor,
          'MATCH',
          pattern,
          'COUNT',
          100,
        );
        cursor = next;
        if (keys.length) {
          // UNLINK is non-blocking vs DEL
          await this.redis.unlink(...keys);
        }
      } while (cursor !== '0');
    } catch (err) {
      this.logger.warn(
        `Cache delByPattern ${pattern} failed: ${(err as Error).message}`,
      );
    }
  }

  /**
   * Cache-aside helper. If key exists return it; otherwise call factory, cache and return.
   * Never throws on Redis failure — falls through to factory.
   */
  async wrap<T>(
    key: string,
    ttlSeconds: number,
    factory: () => Promise<T>,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) return cached;
    const fresh = await factory();
    // Don't cache null/undefined sentinel if you want — but do cache empty arrays
    if (fresh !== null && fresh !== undefined) {
      await this.set(key, fresh, ttlSeconds);
    }
    return fresh;
  }

  /** Deterministic hash for options objects — sorts keys so {a:1,b:2} === {b:2,a:1} */
  static hashOptions(obj: Record<string, unknown>): string {
    const sorted: Record<string, unknown> = {};
    Object.keys(obj)
      .sort()
      .forEach((k) => {
        const v = obj[k];
        if (v !== undefined && v !== null && v !== '') sorted[k] = v;
      });
    return Buffer.from(JSON.stringify(sorted)).toString('base64url');
  }
}
