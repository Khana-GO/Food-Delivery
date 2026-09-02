import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import axios from 'axios';

export interface EsewaPaymentData {
  orderId: string;
  amount: number; // total_amount in NPR, e.g. 650
  productName?: string; // not used in v2 signature but kept for logs
}

export interface EsewaPaymentResponse {
  formUrl: string; // where to POST the form
  fields: Record<string, string>;
  // legacy compat
  url: string;
  params: Record<string, string>;
}

export interface EsewaVerificationResponse {
  status: 'COMPLETE' | 'PENDING' | 'CANCELED' | 'failure' | 'success';
  refId?: string;
  transactionUuid?: string;
  totalAmount?: string;
  message?: string;
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

  constructor(private configService: ConfigService) {
    this.MERCHANT_ID =
      this.configService.get<string>('ESEWA_MERCHANT_ID') || 'EPAYTEST';
    this.SECRET_KEY =
      this.configService.get<string>('ESEWA_SECRET_KEY') || '8gBm/:&EnhH.1/q';
    // Use RC (test) by default when MERCHANT_ID is EPAYTEST, else production
    const isTest = this.MERCHANT_ID === 'EPAYTEST';
    const base =
      this.configService.get<string>('ESEWA_BASE_URL') ||
      (isTest ? 'https://rc-epay.esewa.com.np' : 'https://epay.esewa.com.np');
    this.FORM_URL = `${base.replace(/\/$/, '')}/api/epay/main/v2/form`;
    this.STATUS_URL = `${base.replace(/\/$/, '')}/api/epay/transaction/status/`;
    // Frontend deep links – fallback to web URL if APP_URL not set
    const appUrl =
      this.configService.get<string>('APP_URL') ||
      this.configService.get<string>('FRONTEND_URL_WEB') ||
      'http://localhost:8081';
    const cleanApp = appUrl.replace(/\/$/, '');
    // eSewa requires absolute https urls; for local dev we allow http and let frontend handle custom scheme
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
      const { orderId, amount } = data;
      if (!orderId || !amount || amount <= 0)
        throw new BadRequestException('Invalid orderId or amount');

      // eSewa v2 expects total_amount with 2 decimals; keep consistent with verifyByStatus formatting.
      const totalAmount = Number(amount).toFixed(2);
      const transactionUuid = orderId; // must be unique per transaction; we use orderId
      const productCode = this.MERCHANT_ID;
      const signedFieldNames = 'total_amount,transaction_uuid,product_code';

      const message = `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
      const signature = this.sign(message);

      const fields: Record<string, string> = {
        amount: totalAmount,
        tax_amount: '0',
        total_amount: totalAmount,
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: this.SUCCESS_URL,
        failure_url: this.FAILURE_URL,
        signed_field_names: signedFieldNames,
        signature,
      };

      this.logger.log(
        `eSewa v2 initialized order=${orderId} amount=${totalAmount} product=${productCode} success=${this.SUCCESS_URL}`,
      );

      // Return both new and legacy shape for compatibility
      return {
        formUrl: this.FORM_URL,
        fields,
        url: this.FORM_URL,
        params: fields,
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
      // RC returns JSON {status: "COMPLETE"/"PENDING"/etc, ...}
      const status = (body?.status || '').toUpperCase();
      if (status === 'COMPLETE') {
        return {
          status: 'COMPLETE',
          transactionUuid,
          totalAmount: amt,
          message: 'Payment verified (COMPLETE)',
        };
      }
      if (status === 'PENDING')
        return {
          status: 'PENDING',
          transactionUuid,
          totalAmount: amt,
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
          totalAmount: amt,
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
      return { status: 'failure', message: 'Verification request failed' };
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
      if (!signature || !signed_field_names)
        throw new BadRequestException('Missing signature fields');
      // Rebuild message in order of signed_field_names
      const fields = signed_field_names.split(',').map((k: string) => k.trim());
      const message = fields
        .map((k: string) => `${k}=${payload[k] ?? ''}`)
        .join(',');
      const expected = this.sign(message);
      let signatureValid = false;
      try {
        const a = Buffer.from(expected);
        const b = Buffer.from(signature);
        signatureValid = a.length === b.length && crypto.timingSafeEqual(a, b);
      } catch {
        signatureValid = expected === signature;
      }
      if (!signatureValid) {
        this.logger.warn(
          `eSewa signature mismatch expected=${expected} got=${signature} msg=${message}`,
        );
      } else {
        this.logger.log(
          `eSewa callback signature OK status=${status} uuid=${transaction_uuid}`,
        );
      }

      if ((status || '').toUpperCase() === 'COMPLETE') {
        // Double-check via status API for tamper-proof verification
        const verified = await this.verifyByStatus(
          transaction_uuid,
          total_amount,
        );
        if (verified.status === 'COMPLETE') return verified;
        return verified;
      }
      return {
        status: (status || 'failure').toUpperCase(),
        transactionUuid: transaction_uuid,
        totalAmount: total_amount,
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
