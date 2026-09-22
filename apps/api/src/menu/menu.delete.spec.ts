/**
 * ERR-022 regression tests — deleting a menu item that appears in past orders.
 *
 * `order_items.menu_item_id` is ON DELETE RESTRICT, so the old code let a raw
 * foreign-key violation escape as an opaque HTTP 500. It must now return an
 * actionable 409 (single delete) and skip such items during a bulk delete.
 */
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { MenuItemsService } from './menu.service';
import * as schema from '../db/schema';

function buildService(orderedReferences: number) {
  const deleted: string[] = [];
  let countCalls = 0;

  const db: any = {
    query: {
      menuItemsTable: {
        findFirst: async () => ({
          id: 'item-1',
          name: 'Chicken Momo',
          restaurantId: 'rest-1',
          categoryId: 'cat-1',
          imageUrl: null,
        }),
      },
    },
    select: () => ({
      from: (table: any) => ({
        where: async () => {
          if (table === schema.orderItemsTable) {
            countCalls++;
            return [{ total: orderedReferences }];
          }
          return [{ total: 0 }];
        },
      }),
    }),
    delete: () => ({
      where: async () => {
        deleted.push('item-1');
        return [];
      },
    }),
  };

  const cache: any = {
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
    wrap: jest.fn(async (_k: string, _t: number, fn: any) => fn()),
  };

  const service = new MenuItemsService(
    db,
    {
      uploadImage: jest.fn(),
      deleteImage: jest.fn(async () => undefined),
    } as any,
    { create: jest.fn(async () => ({})) } as any,
    cache,
  );

  return { service, deleted, countCalls: () => countCalls };
}

describe('MenuItemsService.delete (ERR-022)', () => {
  it('returns a 409 (not a 500) for an item referenced by past orders', async () => {
    const { service, deleted } = buildService(2);

    await expect(service.delete('item-1')).rejects.toThrow(ConflictException);
    await expect(service.delete('item-1')).rejects.toThrow(
      /appears in past orders and cannot be deleted/,
    );
    expect(deleted).toHaveLength(0);
  });

  it('still deletes an item with no order history', async () => {
    const { service, deleted, countCalls } = buildService(0);

    await expect(service.delete('item-1')).resolves.toEqual({
      message: 'Menu item deleted successfully',
    });
    expect(deleted).toEqual(['item-1']);
    expect(countCalls()).toBe(1);
  });

  it('maps a raw FK violation to a 409 instead of a 500', async () => {
    const { service } = buildService(0);
    // Force the delete path itself to raise a FK violation (concurrent order).
    (service as any).db.delete = () => ({
      where: async () => {
        const err: any = new Error('violates foreign key constraint');
        err.code = '23503';
        throw err;
      },
    });

    await expect(service.delete('item-1')).rejects.toThrow(ConflictException);
    await expect(service.delete('item-1')).rejects.not.toThrow(
      InternalServerErrorException,
    );
  });
});

describe('MenuItemsService.bulkDelete (ERR-022)', () => {
  it('skips ordered items and reports them instead of failing the batch', async () => {
    const { service, deleted } = buildService(1);

    const result = await service.bulkDelete(['item-1']);

    expect(result.deleted).toBe(0);
    expect(result.message).toMatch(/kept because they appear in past orders/);
    expect(deleted).toHaveLength(0);
  });

  it('deletes unreferenced items normally', async () => {
    const { service, deleted } = buildService(0);

    const result = await service.bulkDelete(['item-1']);

    expect(result.deleted).toBe(1);
    expect(result.message).toMatch(/1 menu items deleted successfully/);
    expect(deleted).toEqual(['item-1']);
  });
});
