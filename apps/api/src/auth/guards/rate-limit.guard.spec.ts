/**
 * ERR-020 regression tests — the rate limiter must not trust client-supplied
 * forwarding headers.
 *
 * Previously `getClientIp()` preferred the raw `x-forwarded-for` header, so an
 * attacker could rotate it to obtain a fresh bucket per request and brute force
 * /auth/login without ever hitting the 5/min limit.
 */
import { HttpException } from '@nestjs/common';
import { RateLimitGuard } from './rate-limit.guard';

function makeContext(request: any) {
  const response = {
    setHeader: jest.fn(),
  };
  return {
    context: {
      switchToHttp: () => ({
        getRequest: () => request,
        getResponse: () => response,
      }),
    } as any,
    response,
  };
}

function makeRequest(extra: Record<string, unknown> = {}) {
  return {
    ip: '10.0.0.1',
    route: { path: '/auth/login' },
    url: '/auth/login',
    headers: {},
    ...extra,
  };
}

function buildGuard(sequence: number[]) {
  let call = 0;
  const evalMock = jest.fn(
    async (..._args: unknown[]) =>
      sequence[Math.min(call++, sequence.length - 1)],
  );
  const redis: any = {
    eval: evalMock,
    ttl: jest.fn(async () => 60),
  };
  return { guard: new RateLimitGuard(redis), evalMock };
}

describe('RateLimitGuard.getClientIp (ERR-020)', () => {
  it('buckets by the real socket IP, not by a spoofed X-Forwarded-For', async () => {
    const { guard, evalMock } = buildGuard([1]);

    const { context } = makeContext(
      makeRequest({ headers: { 'x-forwarded-for': '203.0.113.99' } }),
    );

    await guard.canActivate(context);

    expect(evalMock).toHaveBeenCalledWith(
      expect.any(String),
      1,
      'rate-limit:10.0.0.1:/auth/login',
      expect.any(String),
    );
  });

  it('keeps one shared bucket even when the attacker rotates the header', async () => {
    const { guard, evalMock } = buildGuard([1, 2, 3]);

    for (const spoofed of ['1.1.1.1', '2.2.2.2', '3.3.3.3']) {
      const { context } = makeContext(
        makeRequest({ headers: { 'x-forwarded-for': spoofed } }),
      );
      await guard.canActivate(context);
    }

    const keys = evalMock.mock.calls.map((call) => call[2]);
    expect(new Set(keys).size).toBe(1);
    expect(keys[0]).toBe('rate-limit:10.0.0.1:/auth/login');
  });

  it('still rejects once the limit for that IP is exceeded', async () => {
    const { guard } = buildGuard([1, 2, 3, 4, 5, 6]);

    let thrown: any = null;
    for (let i = 0; i < 6; i++) {
      const { context } = makeContext(
        makeRequest({ headers: { 'x-forwarded-for': `${i}.${i}.${i}.${i}` } }),
      );
      try {
        await guard.canActivate(context);
      } catch (err) {
        thrown = err;
      }
    }

    expect(thrown).toBeInstanceOf(HttpException);
    expect(thrown.getStatus()).toBe(429);
    expect(thrown.message).toMatch(/exceeded the limit of 5 requests/);
  });

  it('honours a genuinely proxied request when req.ip already resolved it', async () => {
    const { guard, evalMock } = buildGuard([1]);

    // Express sets req.ip from XFF only when TRUST_PROXY is configured.
    const { context } = makeContext(
      makeRequest({
        ip: '198.51.100.7',
        headers: { 'x-forwarded-for': '198.51.100.7' },
      }),
    );

    await guard.canActivate(context);

    expect(evalMock.mock.calls[0][2]).toBe(
      'rate-limit:198.51.100.7:/auth/login',
    );
  });
});
