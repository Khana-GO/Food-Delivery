/**
 * ERR-034 — CSV export must neutralise spreadsheet formulas and stream rows.
 */
import { ExportController } from './export.controller';

function buildController(rows: any[]) {
  const service: any = { getOrdersForExport: jest.fn(async () => rows) };
  return new ExportController(service);
}

function fakeResponse() {
  const chunks: string[] = [];
  const response: any = {
    headers: {} as Record<string, string>,
    ended: false,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    write(chunk: string) {
      chunks.push(chunk);
      return true; // never signals backpressure
    },
    end() {
      this.ended = true;
    },
    send() {
      throw new Error('send() should not be used by the CSV export');
    },
  };
  return { response, body: () => chunks.join('') };
}

const row = (overrides: Record<string, unknown> = {}) => ({
  orderId: 'order-1',
  customerName: 'Ram Sharma',
  customerEmail: 'ram@example.com',
  customerPhone: '9800000000',
  restaurantName: 'KhanaGo Kitchen',
  orderDate: new Date('2026-09-01T10:00:00Z'),
  status: 'DELIVERED',
  items: [{ name: 'Momo', quantity: 2 }],
  subtotal: 500,
  deliveryFee: 50,
  total: 550,
  paymentMethod: 'ONLINE',
  paymentStatus: 'PAID',
  notes: 'no chilli',
  ...overrides,
});

describe('ExportController CSV (ERR-034)', () => {
  it('guards against formula injection in user-controlled fields', async () => {
    const controller = buildController([
      row({
        customerName: "=cmd|' /C calc'!A0",
        notes: '@SUM(1+1)*cmd|calc',
      }),
    ]);
    const { response, body } = fakeResponse();

    await controller.exportOrdersCSV(response);

    expect(body()).toContain("'=cmd");
    expect(body()).toContain("'@SUM");
  });

  it('quotes fields containing separators and preserves quotes', async () => {
    const controller = buildController([row({ notes: 'say "hi", please' })]);
    const { response, body } = fakeResponse();

    await controller.exportOrdersCSV(response);

    expect(body()).toContain('"say ""hi"", please"');
  });

  it('sets CSV headers and terminators', async () => {
    const controller = buildController([row()]);
    const { response, body } = fakeResponse();

    await controller.exportOrdersCSV(response);

    expect(response.headers['Content-Type']).toContain('text/csv');
    expect(response.ended).toBe(true);
    expect(body().startsWith('\uFEFF')).toBe(true);
  });

  it('still emits the header row for an empty result set', async () => {
    const controller = buildController([]);
    const { response, body } = fakeResponse();

    await controller.exportOrdersCSV(response);

    expect(body()).toContain('Order ID');
    expect(response.ended).toBe(true);
  });
});
