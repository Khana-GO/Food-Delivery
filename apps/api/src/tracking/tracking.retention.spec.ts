/**
 * Verification tests for ERR-010: driver GPS breadcrumbs are purged once they
 * fall outside the retention window, in bounded batches.
 */
import { TrackingService } from './tracking.service';

/** Walks a drizzle SQL builder and collects every string it carries (the ids). */
function collectStrings(
  node: any,
  out: string[] = [],
  seen: WeakSet<object> = new WeakSet(),
): string[] {
  if (typeof node === 'string') {
    out.push(node);
    return out;
  }
  if (!node || typeof node !== 'object' || seen.has(node)) return out;
  seen.add(node);
  for (const key of Object.keys(node)) {
    const value = node[key];
    if (typeof value === 'string') out.push(value);
    else if (Array.isArray(value))
      value.forEach((entry) => collectStrings(entry, out, seen));
    else if (value && typeof value === 'object')
      collectStrings(value, out, seen);
  }
  return out;
}

function buildService(staleBatches: Array<Array<{ id: string }>>) {
  const deletedIds: string[][] = [];
  let batchIndex = 0;

  const db: any = {
    select: () => ({
      from: () => ({
        where: () => ({
          limit: async () => {
            const batch = staleBatches[batchIndex] ?? [];
            batchIndex += 1;
            return batch;
          },
        }),
      }),
    }),
    delete: () => ({
      where: async (condition: any) => {
        // The condition is an inArray(column, ids) builder; unwrap its values.
        deletedIds.push(collectStrings(condition));
      },
    }),
  };

  const cache: any = {
    get: async () => null,
    set: async () => undefined,
    del: async () => undefined,
  };
  const config: any = { get: () => undefined };

  return { service: new TrackingService(db, cache, config), deletedIds };
}

describe('TrackingService location history retention (ERR-010)', () => {
  it('deletes stale breadcrumb rows and reports the count', async () => {
    const { service, deletedIds } = buildService([
      [{ id: 'loc-1' }, { id: 'loc-2' }],
    ]);

    await expect(service.purgeOldLocationHistory(7)).resolves.toBe(2);
    expect(deletedIds).toHaveLength(1);
    expect(deletedIds[0]).toEqual(expect.arrayContaining(['loc-1', 'loc-2']));
  });

  it('is a no-op when nothing is older than the retention window', async () => {
    const { service, deletedIds } = buildService([[]]);

    await expect(service.purgeOldLocationHistory()).resolves.toBe(0);
    expect(deletedIds).toHaveLength(0);
  });

  it('exposes the scheduled cleanup hook', () => {
    const { service } = buildService([]);
    expect(typeof service.handleLocationHistoryCleanup).toBe('function');
  });
});
