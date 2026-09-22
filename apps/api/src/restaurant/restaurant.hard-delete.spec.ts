/**
 * ERR-019 regression test — admin hard delete of a restaurant must not cascade
 * away its orders and invoices.
 */
import { ConflictException } from '@nestjs/common';
import { RestaurantsService } from './restaurant.service';
import * as schema from '../db/schema';

function buildService(orderCount: number) {
  const deleted: any[] = [];

  const db: any = {
    query: {
      restaurantsTable: {
        findFirst: async () => ({
          id: 'rest-1',
          ownerId: 'owner-1',
          slug: 'khanago-kitchen',
          name: 'KhanaGo Kitchen',
          logoUrl: null,
          coverImageUrl: null,
        }),
      },
    },
    select: () => ({
      from: (table: any) => ({
        where: async () => {
          if (table === schema.ordersTable) return [{ total: orderCount }];
          return [{ total: 0 }];
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        deleted.push('rest-1');
        return [];
      },
    }),
  };

  const cache: any = {
    wrap: jest.fn(async (_k: string, _t: number, fn: any) => fn()),
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
    hashOptions: jest.fn(() => 'hash'),
  };

  const service = new RestaurantsService(
    db,
    { deleteImage: jest.fn(async () => undefined) } as any,
    cache,
    {
      create: jest.fn(async () => ({})),
      createMany: jest.fn(),
      notifyAdmins: jest.fn(),
    } as any,
  );

  return { service, deleted };
}

describe('RestaurantsService.hardDelete (ERR-019)', () => {
  it('refuses to hard delete a restaurant that has orders', async () => {
    const { service, deleted } = buildService(5);

    await expect(service.hardDelete('rest-1')).rejects.toThrow(
      ConflictException,
    );
    expect(deleted).toHaveLength(0);
  });

  it('still hard deletes a restaurant with no order history', async () => {
    const { service, deleted } = buildService(0);

    await expect(service.hardDelete('rest-1')).resolves.toBeUndefined();
    expect(deleted).toEqual(['rest-1']);
  });
});
