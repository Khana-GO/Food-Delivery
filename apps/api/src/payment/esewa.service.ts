import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface EsewaPaymentData {
  orderId?: string; // order id IF it already exists (legacy flow); null for pre-payment flow
  amount: number; // total_amount in NPR, e.g. 650
  productName?: string; // not used in v2 signature but kept for logs
  transactionUuid?: string; // unique transaction id (defaults to orderId)
}

export interface EsewaPaymentResponse {
  formUrl: string; // where to POST the form
  fields: Record<string, string>;
  // legacy compat
  url: string;
  params: Record<string, string>;
  // unique transaction uuid used for this payment session (orderId or generated)
  transactionUuid: string;
  // app routes the WebView should navigate to after verification
  successRoute: { pathname: string; params: Record<string, string | number> };
  failureRoute: { pathname: string; params: Record<string, string | number> };
}

export interface EsewaVerificationResponse {
  status: 'COMPLETE' | 'PENDING' | 'CANCELED' | 'failure' | 'success';
  refId?: string;
  transactionUuid?: string;
  totalAmount?: string;
  message?: string;
  /**
   * True when the eSewa status API could not be reached, so the result is not a
   * statement about the transaction (it must not be treated as a definitive
   * failure, and it must never be treated as a success).
   */
  unavailable?: boolean;
}

@Injectable()
export class EsewaService {
  private readonly logger = new Logger(EsewaService.name);
  private readonly MERCHANT_ID: string;
  private readonly SECRET_KEY: string;
  private readonly FORM_URL: string;
  private readonly STATUS_URL: string;
  private readonly SUCCESS_URL: string;
  private readonly FAILURE_URL: string;
  // EPAYTEST is the shared public sandbox merchant. Its callback signatures
  // cannot be reproduced reliably, so signature mismatches are only fatal for
  // real (production) merchants.
  private readonly IS_TEST_MERCHANT: boolean;

  constructor(private configService: ConfigService) {
    this.MERCHANT_ID =
      this.configService.get<string>('ESEWA_MERCHANT_ID') || 'EPAYTEST';
    this.SECRET_KEY =
      this.configService.get<string>('ESEWA_SECRET_KEY') || '8gBm/:&EnhH.1/q';
    // EPAYTEST is ONLY a valid merchant on the RC (test) sandbox. Pointing the
    // test merchant at the production endpoint makes every payment fail/cancel,
    // so force the RC base whenever the test merchant is used.
    const isTest = this.MERCHANT_ID === 'EPAYTEST';
    this.IS_TEST_MERCHANT = isTest;
    let base = this.configService.get<string>('ESEWA_BASE_URL');
    if (isTest && base && !base.includes('rc-epay')) {
      this.logger.warn(
        `ESEWA_BASE_URL=${base} points to PRODUCTION but MERCHANT_ID is EPAYTEST (test-only). ` +
          `Forcing rc-epay.esewa.com.np. Remove ESEWA_BASE_URL or set it to the RC URL for testing.`,
      );
      base = undefined;
    }
    base =
      base ||
      (isTest ? 'https://rc-epay.esewa.com.np' : 'https://epay.esewa.com.np');
    this.FORM_URL = `${base.replace(/\/$/, '')}/api/epay/main/v2/form`;
    // Status check uses a DIFFERENT host than the form endpoint per eSewa docs:
    // Form:   https://rc-epay.esewa.com.np/api/epay/main/v2/form
    // Status: https://rc.esewa.com.np/api/epay/transaction/status/
    const statusBase = isTest
      ? 'https://rc.esewa.com.np'
      : 'https://esewa.com.np';
    this.STATUS_URL = `${statusBase}/api/epay/transaction/status/`;
    // Frontend callback URLs. In dev the app runs in Expo Go on a real phone,
    // where `localhost` points to the PHONE, not the dev machine – so prefer the
    // LAN IP (FRONTEND_URL_IP) that the phone can actually reach. The mobile
    // WebView intercepts these redirects client-side and verifies server-side.
    const appUrl =
      this.configService.get<string>('FRONTEND_URL_IP') ||
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('FRONTEND_URL_WEB') ||
      'http://localhost:8081';
    const cleanApp = appUrl.replace(/\/$/, '');
    this.SUCCESS_URL = `${cleanApp}/payment/success`;
    this.FAILURE_URL = `${cleanApp}/payment/failure`;
  }

  private sign(message: string): string {
    return crypto
      .createHmac('sha256', this.SECRET_KEY)
      .update(message)
      .digest('base64');
  }

  // ─── Initialize Payment (v2 form) ───
  async initializePayment(
    data: EsewaPaymentData,
  ): Promise<EsewaPaymentResponse> {
    try {
      const { orderId, amount, productName, transactionUuid } = data;
      if (!amount || amount <= 0)
        throw new BadRequestException('Invalid orderId or amount');

      // eSewa v2: total_amount = amount + tax_amount + product_service_charge + product_delivery_charge
      // `amount` = product/service amount only (subtotal)
      // `product_delivery_charge` = delivery fee
      // We keep tax and service charge at 0 since we don't use them.
      const totalAmount = Number(amount).toFixed(2);
      // transaction_uuid must be unique per transaction. In the pre-payment
      // flow (order NOT yet created) callers pass their own UUID; otherwise we
      // default to the order id.
      const txUuid = transactionUuid || orderId;
      if (!txUuid) throw new BadRequestException('Missing transactionUuid');
      const productCode = this.MERCHANT_ID;
      const signedFieldNames = 'total_amount,transaction_uuid,product_code';

      const message = `total_amount=${totalAmount},transaction_uuid=${txUuid},product_code=${productCode}`;
      const signature = this.sign(message);

      const fields: Record<string, string> = {
        amount: totalAmount,
        tax_amount: '0',
        total_amount: totalAmount,
        transaction_uuid: txUuid,
        product_code: productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: this.SUCCESS_URL,
        failure_url: this.FAILURE_URL,
        signed_field_names: signedFieldNames,
        signature,
      };

      this.logger.log(
        `eSewa v2 initialized order=${orderId || txUuid} amount=${totalAmount} product=${productCode} success=${this.SUCCESS_URL}`,
      );

      // Return the app routes the mobile WebView should navigate to after
      // verification. The backend is the single source of truth for where the
      // user lands – the frontend does not create/hardcode success/failure pages.
      return {
        formUrl: this.FORM_URL,
        fields,
        url: this.FORM_URL,
        params: fields,
        transactionUuid: txUuid,
        successRoute: orderId
          ? {
              pathname: '/(customer)/order-confirmation',
              params: { id: orderId },
            }
          : {
              pathname: '/(customer)/checkout/success',
              params: {},
            },
        failureRoute: {
          pathname: '/(customer)/checkout/failure',
          params: {},
        },
      };
    } catch (error: any) {
      this.logger.error(`init eSewa failed: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      throw new BadRequestException('Failed to initialize eSewa payment');
    }
  }

  // ─── Verify via status API (server-to-server) ───
  async verifyByStatus(
    transactionUuid: string,
    totalAmount: string | number,
  ): Promise<EsewaVerificationResponse> {
    try {
      const productCode = this.MERCHANT_ID;
      // Normalize amount to 2 decimals for comparison (eSewa requires consistent format)
      const amt =
        typeof totalAmount === 'number'
          ? totalAmount.toFixed(2)
          : Number(totalAmount).toFixed(2);
      const url = `${this.STATUS_URL}?product_code=${encodeURIComponent(productCode)}&transaction_uuid=${encodeURIComponent(transactionUuid)}&total_amount=${encodeURIComponent(amt)}`;
      this.logger.log(`Verifying eSewa status ${url}`);
      const res = await axios.get(url, {
        timeout: 12000,
        validateStatus: () => true,
      });
      const body = res.data;
      // The status API response carries the amount it actually holds for the
      // transaction. Prefer it over the caller-supplied value so verification
      // is anchored to gateway data instead of client input.
      const reportedAmount =
        body?.total_amount != null && body.total_amount !== ''
          ? Number(body.total_amount).toFixed(2)
          : amt;
      // RC returns JSON {status: "COMPLETE"/"PENDING"/etc, ...}
      const status = (body?.status || '').toUpperCase();
      if (status === 'COMPLETE') {
        return {
          status: 'COMPLETE',
          transactionUuid,
          totalAmount: reportedAmount,
          message: 'Payment verified (COMPLETE)',
        };
      }
      if (status === 'PENDING')
        return {
          status: 'PENDING',
          transactionUuid,
          totalAmount: reportedAmount,
          message: 'Payment pending',
        };
      if (
        status === 'CANCELED' ||
        status === 'FAILED' ||
        status === 'CANCELLED'
      )
        return {
          status: 'CANCELED',
          transactionUuid,
          totalAmount: reportedAmount,
          message: 'Payment canceled/failed',
        };
      //  fallback to legacy shape for callers expecting success/failure
      return {
        status: 'failure',
        message: `Status: ${status || 'unknown'}`,
        transactionUuid,
        totalAmount: amt,
      };
    } catch (error: any) {
      this.logger.error(`status verify failed: ${error.message}`);
      return {
        status: 'failure',
        message: 'Verification request failed',
        unavailable: true,
      };
    }
  }

  // ─── Verify eSewa callback `data` (base64 JSON) ───
  async verifyCallbackData(
    dataB64: string,
  ): Promise<EsewaVerificationResponse> {
    try {
      let jsonStr: string;
      try {
        jsonStr = Buffer.from(dataB64, 'base64').toString('utf-8');
      } catch {
        throw new BadRequestException('Invalid base64 data');
      }
      let payload: any;
      try {
        payload = JSON.parse(jsonStr);
      } catch {
        throw new BadRequestException('Invalid JSON in data');
      }
      const {
        signature,
        signed_field_names,
        status,
        transaction_uuid,
        total_amount,
      } = payload;
      if (!transaction_uuid)
        throw new BadRequestException('Missing transaction_uuid');

      const callbackStatus = (status || '').toUpperCase();

      // ── Amount sanity ───────────────────────────────────────────────────
      // The callback payload is attacker-controlled until the server-to-server
      // status API confirms it. A missing / non-numeric amount must never be
      // turned into a "no verification needed" signal downstream.
      const hasAmount =
        total_amount !== undefined &&
        total_amount !== null &&
        String(total_amount).trim() !== '';
      const parsedAmount = hasAmount ? Number(total_amount) : NaN;
      const hasValidAmount =
        hasAmount && Number.isFinite(parsedAmount) && parsedAmount > 0;

      // ── Signature ───────────────────────────────────────────────────────
      // Informational in the shared EPAYTEST sandbox (its signatures cannot be
      // reproduced reliably). For a real merchant a mismatching signature on a
      // COMPLETE callback is treated as an attack.
      let signatureValid: boolean | null = null;
      if (signature && signed_field_names) {
        try {
          const fields = signed_field_names
            .split(',')
            .map((k: string) => k.trim());
          const message = fields
            .map((k: string) => `${k}=${payload[k] ?? ''}`)
            .join(',');
          const expected = this.sign(message);
          try {
            const a = Buffer.from(expected);
            const b = Buffer.from(signature);
            signatureValid =
              a.length === b.length && crypto.timingSafeEqual(a, b);
          } catch {
            signatureValid = expected === signature;
          }
          if (signatureValid) {
            this.logger.log(
              `eSewa callback signature OK status=${status} uuid=${transaction_uuid}`,
            );
          } else {
            this.logger.warn(
              `eSewa callback signature mismatch status=${status} uuid=${transaction_uuid}`,
            );
          }
        } catch (e: any) {
          this.logger.warn(`eSewa signature check error: ${e?.message}`);
          signatureValid = null;
        }
      }

      // A COMPLETE callback now REQUIRES a usable amount, otherwise it cannot be
      // verified against the gateway at all and must not produce an order.
      if (callbackStatus === 'COMPLETE' && !hasValidAmount) {
        this.logger.warn(
          `eSewa callback COMPLETE without a valid total_amount (uuid=${transaction_uuid}) – rejected`,
        );
        return {
          status: 'failure',
          transactionUuid: transaction_uuid,
          message:
            'Callback is missing a valid total_amount, so the payment cannot be verified',
        };
      }

      if (
        callbackStatus === 'COMPLETE' &&
        signatureValid === false &&
        !this.IS_TEST_MERCHANT
      ) {
        this.logger.error(
          `eSewa callback signature invalid for production merchant (uuid=${transaction_uuid}) – rejected`,
        );
        return {
          status: 'failure',
          transactionUuid: transaction_uuid,
          message: 'Invalid callback signature',
        };
      }

      // ── Authoritative server-to-server check ────────────────────────────
      // eSewa requires total_amount on the status query, so it can only be
      // consulted when the amount survived validation.
      let statusCheck: EsewaVerificationResponse | null = null;
      if (hasValidAmount) {
        statusCheck = await this.verifyByStatus(
          transaction_uuid,
          parsedAmount,
        ).catch((e: any) => {
          this.logger.warn(`status API fallback failed: ${e?.message}`);
          return null;
        });
        // "Could not ask" is not the same as "the gateway said no".
        if (statusCheck?.unavailable) statusCheck = null;
      }

      if (statusCheck && statusCheck.status === 'COMPLETE') {
        // Trust the amount the gateway reports, never the amount the client sent.
        return {
          status: 'COMPLETE',
          refId: statusCheck.refId,
          transactionUuid: transaction_uuid,
          totalAmount: statusCheck.totalAmount ?? String(parsedAmount),
          message: 'Payment verified via eSewa status API',
        };
      }

      // The status API is the ground truth. If it answered, that answer wins –
      // even when the callback claims COMPLETE or carries a larger amount.
      if (statusCheck) return statusCheck;

      // No status API result at all:
      //  - a COMPLETE callback is NOT trusted (an unverifiable payment must not
      //    create a paid order); report pending so the client retries.
      //  - otherwise report the callback status without ever claiming COMPLETE.
      if (callbackStatus === 'COMPLETE') {
        this.logger.warn(
          `eSewa status API unavailable – refusing to trust callback COMPLETE (uuid=${transaction_uuid})`,
        );
        return {
          status: 'PENDING',
          transactionUuid: transaction_uuid,
          totalAmount: hasValidAmount ? String(parsedAmount) : undefined,
          message:
            'Payment could not be verified with eSewa right now; please retry verification',
        };
      }

      return {
        status: callbackStatus === 'CANCELED' ? 'CANCELED' : 'failure',
        transactionUuid: transaction_uuid,
        totalAmount: hasValidAmount ? String(parsedAmount) : undefined,
        message: `Callback status: ${status}`,
      };
    } catch (error: any) {
      this.logger.error(`callback verify failed: ${error.message}`);
      if (error instanceof BadRequestException) throw error;
      return { status: 'failure', message: error.message };
    }
  }

  // ─── Legacy compat: verifyPayment(refId, orderId) as previously called ───
  async verifyPayment(
    refIdOrData: string,
    orderId: string,
  ): Promise<EsewaVerificationResponse> {
    // Heuristic: if refIdOrData looks like base64 JSON with braces, treat as callback data
    const maybeData = refIdOrData;
    if (maybeData && maybeData.length > 40) {
      try {
        const decoded = Buffer.from(maybeData, 'base64').toString('utf-8');
        if (
          decoded.includes('transaction_uuid') &&
          decoded.includes('signature')
        ) {
          return this.verifyCallbackData(maybeData);
        }
      } catch {
        // not data, fall through
      }
    }
    // Otherwise try status API using orderId as transactionUuid; need total_amount – we don't have it here, so try to fetch via unknown amount fallback
    // Caller should use verifyCallbackData or verifyByStatus with amount. For compat, attempt status check without amount by trying common amounts? Instead, try to infer via order lookup? But we don't have DB here.
    // Fallback: treat as failure with guidance
    this.logger.warn(
      `verifyPayment called with refId=${maybeData} orderId=${orderId} – legacy path; attempting status check with unknown amount`,
    );
    // Try status check with dummy amount? eSewa requires correct total_amount, so without it we cannot verify. Return instructive failure.
    return {
      status: 'failure',
      message:
        'Legacy verify with refId unsupported – send `data` base64 or transaction_uuid+total_amount',
    };
  }

  // Helper used by verify endpoint that receives total_amount explicitly
  async verifyWithAmount(
    transactionUuid: string,
    totalAmount: string | number,
  ): Promise<EsewaVerificationResponse> {
    return this.verifyByStatus(transactionUuid, totalAmount);
  }
}
