/**
 * Verification tests for ERR-011: the in-memory session and rate-limit maps
 * must not grow without bound.
 */
import { AIService } from './ai.service';

describe('AIService cache bounds (ERR-011)', () => {
  const build = () => new AIService({} as any, {} as any);

  it('drops expired rate-limit buckets instead of keeping them forever', () => {
    const service = build();
    const rateLimit = (service as any).rateLimit as Map<string, any>;

    const expiredAt = Date.now() - 1000;
    for (let i = 0; i < 6000; i++) {
      rateLimit.set(`user-${i}`, { count: 1, resetAt: expiredAt });
    }

    (service as any).pruneCaches(Date.now());

    expect(rateLimit.size).toBe(0);
  });

  it('evicts idle conversation sessions', () => {
    const service = build();
    const sessions = (service as any).sessions as Map<string, any>;

    const idleSince = Date.now() - 3 * 60 * 60 * 1000; // 3h > 2h TTL
    for (let i = 0; i < 1001; i++) {
      sessions.set(`session-${i}`, {
        id: `session-${i}`,
        userId: 'user-1',
        createdAt: new Date(idleSince),
        lastUsedAt: idleSince,
        messages: [],
      });
    }

    (service as any).pruneCaches(Date.now());

    expect(sessions.size).toBe(0);
  });

  it('keeps recent sessions under the cap', () => {
    const service = build();
    const sessions = (service as any).sessions as Map<string, any>;

    for (let i = 0; i < 5; i++) {
      sessions.set(`session-${i}`, {
        id: `session-${i}`,
        userId: 'user-1',
        createdAt: new Date(),
        lastUsedAt: Date.now(),
        messages: [],
      });
    }

    (service as any).pruneCaches(Date.now());

    expect(sessions.size).toBe(5);
  });
});
