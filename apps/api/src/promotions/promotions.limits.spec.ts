/**
 * ERR-026 regression tests — promotion usage limits.
 *
 * Before: `usedCount` was read from a 300s cache, the per-user check was
 * commented out, and `applyPromotion` incremented unconditionally, so a
 * single-use code could be redeemed repeatedly (and concurrently).
 */
import { ConflictException } from '@nestjs/common';
import { PromotionsService } from './promotions.service';

const basePromotion = {
  id: 'promo-1',
  code: 'WELCOME50',
  description: 'Welcome',
  discountType: 'PERCENTAGE',
  discountValue: '20',
  minOrderAmount: '100',
  maxDiscount: '150',
  usageLimit: 1,
  usedCount: 0,
  isActive: true,
  validFrom: new Date(Date.now() - 86_400_000),
  validUntil: new Date(Date.now() + 86_400_000),
};

function buildService(options: {
  promotion?: any;
  userUsageCount?: number;
  applyUpdatedRows?: number;
}) {
  const usageInserts: any[] = [];

  const db: any = {
    query: {
      promotionsTable: {
        findFirst: async () => options.promotion ?? basePromotion,
      },
    },
    select: () => ({
      from: () => ({
        where: async () => [{ total: options.userUsageCount ?? 0 }],
      }),
    }),
    update: () => ({
      set: () => ({
        where: () => ({
          returning: async () =>
            options.applyUpdatedRows === 0 ? [] : [{ id: 'promo-1' }],
        }),
      }),
    }),
    insert: () => ({
      values: async (row: any) => {
        usageInserts.push(row);
        return [];
      },
    }),
  };

  const cache: any = {
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
  };

  const service = new PromotionsService(db, cache);
  return { service, usageInserts, cache };
}

describe('PromotionsService validation limits (ERR-026)', () => {
  it('rejects a code whose global limit is already reached', async () => {
    const { service } = buildService({
      promotion: { ...basePromotion, usedCount: 1 },
    });

    const result = await service.validatePromotion(
      { code: 'WELCOME50', subtotal: 1000 },
      'cust-1',
    );

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/usage limit exceeded/i);
  });

  it('rejects a single-use code that this user has already redeemed', async () => {
    const { service } = buildService({ userUsageCount: 1 });

    const result = await service.validatePromotion(
      { code: 'WELCOME50', subtotal: 1000 },
      'cust-1',
    );

    expect(result.valid).toBe(false);
    expect(result.message).toMatch(/already used/i);
  });

  it('allows an unlimited code (usageLimit 0) to be reused by the same user', async () => {
    const { service } = buildService({
      promotion: { ...basePromotion, usageLimit: 0, usedCount: 500 },
      userUsageCount: 5,
    });

    const result = await service.validatePromotion(
      { code: 'WELCOME50', subtotal: 1000 },
      'cust-1',
    );

    expect(result.valid).toBe(true);
  });

  it('rounds the discount to 2 decimals and clamps it to the subtotal', async () => {
    const { service } = buildService({
      promotion: { ...basePromotion, maxDiscount: '9999' },
    });

    const result = await service.validatePromotion(
      { code: 'WELCOME50', subtotal: 333.33 },
      'cust-1',
    );

    // 20% of 333.33 = 66.666 → 66.67
    expect(result.discountAmount).toBe(66.67);

    const capped = buildService({
      promotion: {
        ...basePromotion,
        discountType: 'FIXED',
        discountValue: '5000',
      },
    });
    const cappedResult = await capped.service.validatePromotion(
      { code: 'WELCOME50', subtotal: 200 },
      'cust-1',
    );
    expect(cappedResult.discountAmount).toBe(200);
  });

  it('does not read the promotion from cache (stale counters)', async () => {
    const { service, cache } = buildService({});
    await service.validatePromotion(
      { code: 'WELCOME50', subtotal: 1000 },
      'cust-1',
    );
    expect(cache.get).not.toHaveBeenCalled();
  });
});

describe('PromotionsService.applyPromotion (ERR-026)', () => {
  it('records usage when the limit still allows it', async () => {
    const { service, usageInserts } = buildService({});

    await service.applyPromotion('WELCOME50', 'cust-1', 'order-1', 150);

    expect(usageInserts).toHaveLength(1);
    expect(usageInserts[0]).toMatchObject({
      promotionId: 'promo-1',
      userId: 'cust-1',
      orderId: 'order-1',
      discountAmount: '150',
    });
  });

  it('throws a conflict when the atomic increment finds the limit reached', async () => {
    const { service, usageInserts } = buildService({ applyUpdatedRows: 0 });

    await expect(
      service.applyPromotion('WELCOME50', 'cust-1', 'order-1', 150),
    ).rejects.toThrow(ConflictException);

    expect(usageInserts).toHaveLength(0);
  });
});
