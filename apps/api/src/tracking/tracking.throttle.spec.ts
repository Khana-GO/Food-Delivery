/** ERR-027 — the per-driver location throttle map must not grow forever. */
import { TrackingGateway } from './tracking.gateway';

function buildGateway() {
  const sessions: any = { isTokenRevoked: jest.fn(async () => false) };
  const tracking: any = {};
  const config: any = { get: jest.fn() };
  const jwt: any = {};
  const gateway = new TrackingGateway(jwt, config, sessions, tracking);
  return gateway;
}

describe('TrackingGateway throttle pruning (ERR-027)', () => {
  it('drops stale driver/order entries', () => {
    const gateway = buildGateway();
    const map = (gateway as any).lastLocationAt as Map<string, number>;
    const ttl = (gateway as any).THROTTLE_ENTRY_TTL_MS as number;
    const now = Date.now();

    map.set('driver-1:order-1', now); // fresh
    map.set('driver-2:order-2', now - ttl - 1_000); // stale
    map.set('driver-3:order-3', now - ttl - 60_000); // stale

    (gateway as any).pruneLocationThrottle(now);

    expect(map.size).toBe(1);
    expect(map.has('driver-1:order-1')).toBe(true);
  });

  it('keeps the map bounded across many drivers', () => {
    const gateway = buildGateway();
    const map = (gateway as any).lastLocationAt as Map<string, number>;
    const ttl = (gateway as any).THROTTLE_ENTRY_TTL_MS as number;
    const now = Date.now();

    for (let i = 0; i < 500; i++) {
      map.set(`old-driver-${i}:order-${i}`, now - ttl - 1);
    }
    map.set('current:order', now);

    (gateway as any).pruneLocationThrottle(now);

    expect(map.size).toBe(1);
  });
});
