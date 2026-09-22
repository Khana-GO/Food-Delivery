/**
 * ERR-017 regression tests — eSewa callback verification.
 *
 * Reproduces the original exploit: a forged, unsigned eSewa `data` payload that
 * claims `COMPLETE` (and omits `total_amount`) used to be trusted, producing a
 * COMPLETE verification with a non-numeric amount. The amount cross-check in
 * createPaidOrder then skipped itself (NaN), so an arbitrarily large order was
 * created as PAID from a tiny real transaction.
 */
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';
import { EsewaService } from './esewa.service';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

function b64(obj: unknown): string {
  return Buffer.from(JSON.stringify(obj), 'utf-8').toString('base64');
}

function buildService(overrides: Record<string, string> = {}): EsewaService {
  const env: Record<string, string> = {
    ESEWA_MERCHANT_ID: 'EPAYTEST',
    ESEWA_SECRET_KEY: '8gBm/:&EnhH.1/q',
    ESEWA_BASE_URL: 'https://rc-epay.esewa.com.np',
    FRONTEND_URL_WEB: 'http://localhost:8081',
    ...overrides,
  };
  const config: any = { get: (key: string) => env[key] };
  return new EsewaService(config);
}

/** Status API answered with `body`. */
function statusApiReturns(body: unknown) {
  mockedAxios.get.mockResolvedValue({ data: body });
}

/** Status API unreachable. */
function statusApiDown() {
  mockedAxios.get.mockRejectedValue(new Error('ECONNREFUSED'));
}

describe('EsewaService.verifyCallbackData (ERR-017)', () => {
  beforeEach(() => {
    mockedAxios.get.mockReset();
  });

  it('rejects a forged COMPLETE callback that omits total_amount', async () => {
    const service = buildService();

    const result = await service.verifyCallbackData(
      b64({ status: 'COMPLETE', transaction_uuid: 'tx-1' }),
    );

    expect(result.status).toBe('failure');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('rejects a forged COMPLETE callback whose amount is non-numeric', async () => {
    const service = buildService();

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: 'abc',
      }),
    );

    expect(result.status).toBe('failure');
  });

  it('does not trust a forged amount: the status API answer wins', async () => {
    const service = buildService();
    // Attacker claims a NPR 20000 payment, but eSewa only knows a NPR 10 one.
    statusApiReturns({ status: 'NOT_FOUND' });

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '20000',
      }),
    );

    expect(result.status).not.toBe('COMPLETE');
  });

  it('rejects a COMPLETE callback when the status API cannot be consulted', async () => {
    const service = buildService();
    statusApiDown();

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '20000',
      }),
    );

    // Fail closed: the client retries later, no paid order is created.
    expect(result.status).toBe('PENDING');
  });

  it('returns the gateway-reported amount for a genuine COMPLETE payment', async () => {
    const service = buildService();
    statusApiReturns({
      status: 'COMPLETE',
      total_amount: '900.0',
      ref_id: 'ref-1',
    });

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '900',
      }),
    );

    expect(result.status).toBe('COMPLETE');
    expect(result.totalAmount).toBe('900.00');
  });

  it('ignores the client amount and uses the gateway amount when they differ', async () => {
    const service = buildService();
    statusApiReturns({ status: 'COMPLETE', total_amount: '10.00' });

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '10',
      }),
    );

    expect(result.status).toBe('COMPLETE');
    // Gateway wins — the caller cross-checks this against the order total.
    expect(Number(result.totalAmount)).toBe(10);
  });

  it('blocks a bad signature for a real (non-sandbox) merchant', async () => {
    const service = buildService({
      ESEWA_MERCHANT_ID: 'REALMERCHANT',
      ESEWA_BASE_URL: 'https://epay.esewa.com.np',
    });

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '900',
        signature: 'not-a-valid-signature',
        signed_field_names: 'total_amount,transaction_uuid,product_code',
      }),
    );

    expect(result.status).toBe('failure');
    expect(mockedAxios.get).not.toHaveBeenCalled();
  });

  it('keeps sandbox payments working despite an unreproducible signature', async () => {
    const service = buildService();
    statusApiReturns({ status: 'COMPLETE', total_amount: '900.00' });

    const result = await service.verifyCallbackData(
      b64({
        status: 'COMPLETE',
        transaction_uuid: 'tx-1',
        total_amount: '900',
        signature: 'sandbox-signature-that-does-not-match',
        signed_field_names: 'total_amount,transaction_uuid,product_code',
      }),
    );

    expect(result.status).toBe('COMPLETE');
  });

  it('still rejects malformed callback payloads', async () => {
    const service = buildService();
    await expect(
      service.verifyCallbackData('!!!not-base64-json!!!'),
    ).rejects.toThrow(BadRequestException);
  });
});
