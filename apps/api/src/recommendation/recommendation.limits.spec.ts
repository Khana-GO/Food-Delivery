/**
 * ERR-028 — a caller-supplied `limit` must be clamped before it reaches a query
 * or a cache key.
 */
import { RecommendationsService } from './recommendation.service';

function buildService(captured: { limit?: number }[]) {
  const db: any = {
    select: () => ({
      from: (table: any) => ({
        where: () => ({
          orderBy: () => ({
            limit: async (n: number) => {
              captured.push({ limit: n });
              return [];
            },
          }),
        }),
        orderBy: () => ({
          limit: async (n: number) => {
            captured.push({ limit: n });
            return [];
          },
        }),
      }),
    }),
  };
  const cache: any = { get: jest.fn(async () => null), set: jest.fn() };
  return new RecommendationsService(db, cache);
}

describe('RecommendationsService limit clamping (ERR-028)', () => {
  it('clamps an absurd popular-restaurants limit', async () => {
    const captured: { limit?: number }[] = [];
    const service = buildService(captured);

    await service.getPopularRestaurants(1_000_000);

    expect(captured[0]?.limit).toBe(50);
  });

  it('falls back for NaN / negative / zero limits', async () => {
    for (const bad of [NaN, -5, 0]) {
      const captured: { limit?: number }[] = [];
      const service = buildService(captured);
      await service.getPopularRestaurants(bad);
      expect(captured[0]?.limit).toBe(10);
    }
  });

  it('keeps reasonable limits untouched', async () => {
    const captured: { limit?: number }[] = [];
    const service = buildService(captured);

    await service.getPopularRestaurants(7);

    expect(captured[0]?.limit).toBe(7);
  });
});
