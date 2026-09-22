/**
 * Baseline security response headers.
 *
 * They are set explicitly (instead of pulling in `helmet`) to keep the
 * dependency surface unchanged. HSTS is only advertised in production so local
 * HTTP development is not pinned to HTTPS by a cached header.
 */
export function buildSecurityHeaders(options: {
  isProduction: boolean;
}): Record<string, string> {
  const headers: Record<string, string> = {
    // Stop MIME-sniffing of responses (e.g. a JSON error rendered as HTML).
    'X-Content-Type-Options': 'nosniff',
    // The API is not designed to be framed.
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'X-DNS-Prefetch-Control': 'off',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-site',
    // Location is needed for delivery tracking; camera/mic never are.
    'Permissions-Policy': 'geolocation=(self), camera=(), microphone=()',
  };

  if (options.isProduction) {
    headers['Strict-Transport-Security'] =
      'max-age=15552000; includeSubDomains';
  }

  return headers;
}
