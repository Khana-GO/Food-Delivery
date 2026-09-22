/**
 * Verification tests for the payment-integrity / promo fixes:
 *  - ERR-001 eSewa amount tampering (server recalculates and cross-checks)
 *  - ERR-002 payment reference replay protection
 *  - ERR-005 promo discount applied server-side and recorded
 */
import { BadRequestException, ConflictException } from '@nestjs/common';
import { OrdersService } from './order.service';
import { CreateOrderDto, PaymentMethod } from './dto/create-order.dto';

const restaurant = {
  id: 'rest-1',
  ownerId: 'owner-1',
  name: 'KhanaGo Kitchen',
  address: 'Thamel',
  deliveryFee: '50.00',
  minimumOrderAmount: '0.00',
  isOpen: true,
  isActive: true,
  isVerified: true,
};

const address = {
  id: 'addr-1',
  userId: 'cust-1',
  addressLine: 'Lazimpat',
  city: 'Kathmandu',
  state: 'Bagmati',
  country: 'Nepal',
  postalCode: '44600',
  isActive: true,
};

// 2 x 500 = 1000 subtotal, +50 delivery, -150 promo = 900 payable
const menuItems = [
  {
    id: 'm1',
    name: 'Chicken Momo',
    price: '500.00',
    restaurantId: 'rest-1',
    isAvailable: true,
  },
];

const orderRow = {
  id: 'order-1',
  customerId: 'cust-1',
  restaurantId: 'rest-1',
  driverId: null,
  addressId: 'addr-1',
  deliveryAddressSnapshot: 'Lazimpat, Kathmandu',
  subtotal: '1000.00',
  deliveryFee: '50.00',
  discount: '150.00',
  totalAmount: '900.00',
  notes: null,
  paymentId: 'esewa-pay-1',
  paymentMethod: 'ONLINE',
  paymentStatus: 'PAID',
  orderStatus: 'CONFIRMED',
  estimatedDeliveryTime: null,
  estimatedDeliveryMinutes: null,
  deliveredAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const dto: CreateOrderDto = {
  restaurantId: 'rest-1',
  addressId: 'addr-1',
  items: [{ menuItemId: 'm1', quantity: 2 }],
  promoCode: 'WELCOME50',
  paymentMethod: PaymentMethod.ONLINE,
};

function buildService(
  options: { existingOrder?: any; promoValid?: boolean } = {},
) {
  const insertedValues: any[] = [];
  let insertCall = 0;

  const tx = {
    insert: () => ({
      values: (values: any) => {
        const idx = insertCall++;
        insertedValues.push(values);
        return {
          returning: async () =>
            idx === 0
              ? [orderRow]
              : (values as any[]).map((item, i) => ({
                  id: `item-${i}`,
                  ...item,
                })),
        };
      },
    }),
  };

  const db: any = {
    query: {
      ordersTable: {
        findFirst: async () =>
          options.existingOrder ? { ...orderRow } : undefined,
      },
      usersTable: {
        findFirst: async () => ({
          id: 'cust-1',
          firstName: 'Ram',
          lastName: 'Sharma',
          phone: '9800000000',
        }),
      },
      restaurantsTable: { findFirst: async () => restaurant },
      addressesTable: { findFirst: async () => address },
    },
    select: () => ({ from: () => ({ where: async () => menuItems }) }),
    transaction: async (cb: any) => cb(tx),
  };

  const cache: any = {
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
    wrap: jest.fn(async (_k: string, _t: number, fn: any) => fn()),
  };
  const notificationsService: any = { create: jest.fn(async () => undefined) };
  const invoicesService: any = {
    createInvoiceFromOrder: jest.fn(async () => undefined),
  };
  const promotionsService: any = {
    validatePromotion: jest.fn(async () =>
      options.promoValid === false
        ? { valid: false, message: 'Invalid promotion code' }
        : { valid: true, message: 'ok', discountAmount: 150 },
    ),
    applyPromotion: jest.fn(async () => undefined),
  };

  const service = new OrdersService(
    db,
    cache,
    notificationsService,
    invoicesService,
    promotionsService,
  );

  return { service, insertedValues, promotionsService };
}

describe('OrdersService payment integrity (ERR-001 / ERR-002 / ERR-005)', () => {
  it('rejects a paid order when the verified gateway amount does not match the server total', async () => {
    const { service, insertedValues } = buildService();

    // Customer claims a NPR 100 payment but the items are worth NPR 900.
    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 100),
    ).rejects.toThrow(BadRequestException);

    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 100),
    ).rejects.toThrow(/Payment amount mismatch/);

    // No order must have been written.
    expect(insertedValues).toHaveLength(0);
  });

  it('refuses to create a paid order when the verified amount is not a number', async () => {
    // Regression for the forged-callback exploit: a NaN amount used to disable
    // the cross-check entirely, creating a PAID order of arbitrary value.
    const { service, insertedValues } = buildService();

    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', NaN),
    ).rejects.toThrow(/could not be verified/);
    expect(insertedValues).toHaveLength(0);
  });

  it('refuses to create a paid order when the verified amount is zero or negative', async () => {
    const { service, insertedValues } = buildService();

    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 0),
    ).rejects.toThrow(BadRequestException);
    expect(insertedValues).toHaveLength(0);
  });

  it('creates the order when the verified amount matches the server total', async () => {
    const { service, insertedValues } = buildService();

    const order = await service.createPaidOrder(
      'cust-1',
      dto,
      'esewa-pay-1',
      900,
    );

    expect(order.id).toBe('order-1');
    expect(insertedValues).toHaveLength(2);
    expect(insertedValues[0]).toMatchObject({
      subtotal: '1000.00',
      deliveryFee: '50.00',
      discount: '150.00',
      totalAmount: '900.00',
      paymentStatus: 'PAID',
    });
  });

  it('refuses to reuse a payment reference that already produced an order', async () => {
    const { service, insertedValues } = buildService({
      existingOrder: orderRow,
    });

    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 900),
    ).rejects.toThrow(ConflictException);
    expect(insertedValues).toHaveLength(0);
  });

  it('applies the promo discount server-side and records the usage', async () => {
    const { service, insertedValues, promotionsService } = buildService();

    await service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 900);

    expect(promotionsService.validatePromotion).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'WELCOME50', subtotal: 1000 }),
      'cust-1',
    );
    expect(promotionsService.applyPromotion).toHaveBeenCalledWith(
      'WELCOME50',
      'cust-1',
      'order-1',
      150,
    );
    expect(insertedValues[0].totalAmount).toBe('900.00');
  });

  it('rejects an invalid promo code instead of silently charging full price', async () => {
    const { service, insertedValues } = buildService({ promoValid: false });

    await expect(
      service.createPaidOrder('cust-1', dto, 'esewa-pay-1', 900),
    ).rejects.toThrow(/Invalid promotion code/);
    expect(insertedValues).toHaveLength(0);
  });
});
