/**
 * ERR-018 regression test — permanent user deletion must not cascade away
 * financial history.
 *
 * `orders.customer_id` and `restaurants.owner_id` are ON DELETE CASCADE, and
 * orders cascade into order_items and invoices. Hard-deleting a user who has
 * any order (as customer, or at a restaurant they own) used to delete all of
 * it. The service now refuses instead.
 */
import { ConflictException } from '@nestjs/common';
import { UsersService } from './users.service';
import * as schema from '../db/schema';

function buildService(options: {
  ownedRestaurantIds?: string[];
  orderCount?: number;
}) {
  const deleted: any[] = [];
  const revokedUsers: string[] = [];

  const db: any = {
    query: {
      usersTable: {
        findFirst: async () => ({
          id: 'user-1',
          email: 'ram@example.com',
          role: 'CUSTOMER',
          deletedAt: null,
        }),
      },
    },
    select: () => ({
      from: (table: any) => ({
        where: async () => {
          if (table === schema.restaurantsTable) {
            return (options.ownedRestaurantIds ?? []).map((id) => ({ id }));
          }
          // orders → count row
          return [{ total: options.orderCount ?? 0 }];
        },
      }),
    }),
    delete: () => ({
      where: () => ({
        returning: async () => {
          deleted.push('user-1');
          return [{ id: 'user-1' }];
        },
      }),
    }),
  };

  const cache: any = {
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
    wrap: jest.fn(async (_k: string, _t: number, fn: any) => fn()),
  };

  const service = new UsersService(
    db,
    { get: jest.fn() } as any,
    { uploadImage: jest.fn(), deleteImage: jest.fn() } as any,
    { create: jest.fn(async () => null) } as any,
    cache,
    {
      revokeAllForUser: jest.fn(async (userId: string) => {
        revokedUsers.push(userId);
        return 1;
      }),
    } as any,
  );

  return { service, deleted, revokedUsers };
}

describe('UsersService.hardDelete (ERR-018)', () => {
  it('refuses to permanently delete a user who has placed orders', async () => {
    const { service, deleted } = buildService({ orderCount: 3 });

    await expect(service.hardDelete('user-1', 'admin-1')).rejects.toThrow(
      ConflictException,
    );
    expect(deleted).toHaveLength(0);
  });

  it('refuses when the user owns a restaurant that has orders', async () => {
    const { service, deleted } = buildService({
      ownedRestaurantIds: ['rest-1'],
      orderCount: 1,
    });

    await expect(service.hardDelete('user-1', 'admin-1')).rejects.toThrow(
      ConflictException,
    );
    expect(deleted).toHaveLength(0);
  });

  it('still allows permanent deletion of a user with no order history', async () => {
    const { service, deleted, revokedUsers } = buildService({ orderCount: 0 });

    await expect(
      service.hardDelete('user-1', 'admin-1'),
    ).resolves.toBeUndefined();
    expect(deleted).toEqual(['user-1']);
    // ERR-042: the deleted user's still-valid access tokens must be revoked.
    expect(revokedUsers).toEqual(['user-1']);
  });

  it('still prevents deleting your own account', async () => {
    const { service, deleted } = buildService({ orderCount: 0 });

    await expect(service.hardDelete('user-1', 'user-1')).rejects.toThrow(
      /your own account/,
    );
    expect(deleted).toHaveLength(0);
  });
});
