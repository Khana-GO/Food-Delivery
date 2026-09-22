/** ERR-032 — the in-memory Redis stand-in must not grow without bound. */
import { InMemoryRedisClient } from './in-memory-redis.client';

describe('InMemoryRedisClient expiry sweeping (ERR-032)', () => {
  it('sweeps expired keys while writing, even if they are never read', async () => {
    const client = new InMemoryRedisClient();
    const store = (client as any).store as Map<string, unknown>;

    // 100 entries that expire immediately (never read again).
    for (let i = 0; i < 100; i++) {
      await client.set(`expired:${i}`, 'v', 'EX', 0);
    }
    expect(store.size).toBe(100);

    // Push past the sweep threshold with live keys.
    for (let i = 0; i < 200; i++) {
      await client.set(`live:${i}`, 'v', 'EX', 600);
    }

    // Expired keys are gone; the live ones survive.
    expect(store.size).toBeLessThan(300);
    expect(store.has('live:199')).toBe(true);
    expect(store.has('expired:0')).toBe(false);
  });

  it('keeps unexpiring keys', async () => {
    const client = new InMemoryRedisClient();
    await client.set('forever', 'v');
    for (let i = 0; i < 250; i++) {
      await client.set(`k:${i}`, 'v', 'EX', 0);
    }
    expect(await client.get('forever')).toBe('v');
  });

  it('still honours TTL reads', async () => {
    const client = new InMemoryRedisClient();
    await client.set('short', 'v', 'EX', 60);
    expect(await client.get('short')).toBe('v');
    expect(await client.ttl('short')).toBeGreaterThan(0);
  });
});
