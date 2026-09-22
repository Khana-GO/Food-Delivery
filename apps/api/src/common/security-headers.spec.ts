/** ERR-033 — baseline security headers. */
import { buildSecurityHeaders } from './security-headers';

describe('buildSecurityHeaders (ERR-033)', () => {
  it('always sets the core hardening headers', () => {
    const headers = buildSecurityHeaders({ isProduction: false });

    expect(headers['X-Content-Type-Options']).toBe('nosniff');
    expect(headers['X-Frame-Options']).toBe('DENY');
    expect(headers['Referrer-Policy']).toBe('no-referrer');
    expect(headers['Permissions-Policy']).toContain('geolocation=(self)');
  });

  it('only advertises HSTS in production', () => {
    expect(
      buildSecurityHeaders({ isProduction: false })[
        'Strict-Transport-Security'
      ],
    ).toBeUndefined();
    expect(
      buildSecurityHeaders({ isProduction: true })['Strict-Transport-Security'],
    ).toContain('max-age=');
  });
});
