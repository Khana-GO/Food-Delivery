/** ERR-031 — invoice numbers must come from a CSPRNG with a large space. */
import { InvoicesService } from './invoices.service';

function buildService(): InvoicesService {
  const db: any = {};
  const cache: any = {};
  return new InvoicesService(db, cache);
}

describe('InvoicesService.generateInvoiceNumber (ERR-031)', () => {
  it('formats as INV-<yyyymmdd>-<6 digits>', () => {
    const service = buildService();
    const value = (service as any).generateInvoiceNumber();

    expect(value).toMatch(/^INV-\d{8}-\d{6}$/);
    expect(value.length).toBeLessThanOrEqual(50);
  });

  it('produces well-distributed values (not a 9,000-value space)', () => {
    const service = buildService();
    const seen = new Set<string>();

    for (let i = 0; i < 2000; i++) {
      seen.add((service as any).generateInvoiceNumber());
    }

    // 2000 draws from a 1,000,000-per-day space: collisions should be rare.
    expect(seen.size).toBeGreaterThan(1990);
  });
});
