/**
 * Verification tests for ERR-003: invoice totals must reconcile with the
 * amount the customer actually paid (order.totalAmount) and the tax must be
 * derived from the VAT-inclusive price instead of added on top of it.
 */
import { InvoicesService } from './invoices.service';

function buildService(order: Record<string, any>) {
  const insertedValues: any[] = [];

  const db: any = {
    query: {
      ordersTable: { findFirst: async () => order },
      restaurantsTable: {
        findFirst: async () => ({ id: order.restaurantId, name: 'KhanaGo' }),
      },
      usersTable: {
        findFirst: async () => ({
          id: order.customerId,
          firstName: 'Ram',
          lastName: 'Sharma',
        }),
      },
    },
    insert: () => ({
      values: (values: any) => {
        insertedValues.push(values);
        return {
          returning: async () => [
            {
              id: 'inv-1',
              ...values,
              issuedAt: new Date(),
              paidAt: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ],
        };
      },
    }),
  };

  const cache: any = {
    del: jest.fn(async () => undefined),
    delByPattern: jest.fn(async () => undefined),
    get: jest.fn(async () => null),
    set: jest.fn(async () => undefined),
  };

  return {
    service: new InvoicesService(db, cache),
    insertedValues,
  };
}

const baseOrder = {
  id: 'order-1',
  customerId: 'cust-1',
  restaurantId: 'rest-1',
  paymentMethod: 'ONLINE',
  paymentStatus: 'PAID',
};

describe('InvoicesService totals (ERR-003)', () => {
  it('bills exactly what the customer paid — no phantom VAT on top', async () => {
    const { service, insertedValues } = buildService({
      ...baseOrder,
      subtotal: '500.00',
      deliveryFee: '50.00',
      discount: '0.00',
      totalAmount: '550.00',
    });

    await service.createInvoiceFromOrder('order-1');

    const invoice = insertedValues[0];
    expect(invoice.total).toBe('550.00');
    expect(invoice.subtotal).toBe('500.00');
    expect(invoice.deliveryFee).toBe('50.00');
    // Tax is the VAT portion of the inclusive subtotal, not an added charge.
    expect(Number(invoice.tax)).toBeCloseTo(57.52, 2);
    expect(
      Number(invoice.subtotal) +
        Number(invoice.deliveryFee) -
        Number(invoice.discount),
    ).toBeCloseTo(Number(invoice.total), 2);
  });

  it('carries the promo discount through to the invoice', async () => {
    const { service, insertedValues } = buildService({
      ...baseOrder,
      subtotal: '1000.00',
      deliveryFee: '50.00',
      discount: '150.00',
      totalAmount: '900.00',
    });

    await service.createInvoiceFromOrder('order-1');

    const invoice = insertedValues[0];
    expect(invoice.discount).toBe('150.00');
    expect(invoice.total).toBe('900.00');
    expect(Number(invoice.tax)).toBeCloseTo(97.79, 2);
    expect(Number(invoice.total)).toBeLessThan(1100); // old bug produced 1130.00
  });
});
