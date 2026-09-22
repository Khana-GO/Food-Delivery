/**
 * Verification tests for ERR-008: token revocation is persisted in the shared
 * store, so it survives an API restart and is visible to other instances.
 */
import { SessionsService } from './sessions.service';

function buildSharedCache() {
  const store = new Map<string, any>();
  return {
    store,
    cache: {
      get: async (key: string) => (store.has(key) ? store.get(key) : null),
      set: async (key: string, value: unknown) => {
        store.set(key, value);
      },
      del: async (key: string) => {
        store.delete(key);
      },
      delByPattern: async () => undefined,
    } as any,
  };
}

describe('SessionsService persistent revocation (ERR-008)', () => {
  it('rejects a token revoked by a different instance / after a restart', async () => {
    const { cache, store } = buildSharedCache();
    const db: any = {};

    // Instance A revokes the token, then "restarts" (new instance, same store).
    const instanceA = new SessionsService(db, cache);
    await instanceA.revokeToken('access-token-1', 'user-1');
    expect(store.size).toBeGreaterThan(0);

    const instanceB = new SessionsService(db, cache);
    await expect(instanceB.isTokenRevoked('access-token-1')).resolves.toBe(
      true,
    );
    await expect(instanceB.isTokenRevoked('untouched-token')).resolves.toBe(
      false,
    );
  });

  it('invalidates the user session but still allows a fresh login', async () => {
    const { cache } = buildSharedCache();
    const freshInstance = new SessionsService({} as any, cache);

    const revokedBefore = Math.floor(Date.now() / 1000);
    await freshInstance.revokeToken('refresh-token', 'user-1');

    // Token issued before the logout is rejected…
    await expect(
      freshInstance.isTokenRevoked('old-token', {
        userId: 'user-1',
        issuedAtSeconds: revokedBefore - 30,
      }),
    ).resolves.toBe(true);

    // …but a token issued after it (fresh login) stays valid.
    await expect(
      freshInstance.isTokenRevoked('new-token', {
        userId: 'user-1',
        issuedAtSeconds: revokedBefore + 30,
      }),
    ).resolves.toBe(false);
  });
});
