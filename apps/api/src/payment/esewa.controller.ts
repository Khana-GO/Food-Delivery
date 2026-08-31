import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EsewaService } from './esewa.service';
import { OrdersService } from '../order/order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { EsewaInitDto } from './dto/esewa-init.dto';
import { EsewaVerifyDto } from './dto/esewa-verify.dto';

@ApiTags('Payment - eSewa v2')
@Controller('payment/esewa')
export class EsewaController {
  constructor(
    private readonly esewaService: EsewaService,
    private readonly ordersService: OrdersService,
  ) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize eSewa payment (v2 form)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async initialize(@Body() dto: EsewaInitDto) {
    return this.esewaService.initializePayment({
      orderId: dto.orderId,
      amount: dto.amount,
      productName: dto.productName || 'KhanaGo Order',
    });
  }

  // Preferred: verify via callback `data` (base64 from success_url?data=...)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Verify eSewa payment via callback data or status API',
  })
  async verify(@CurrentUser() user: JwtPayload, @Body() dto: EsewaVerifyDto) {
    let result: any;

    if (dto.data) {
      result = await this.esewaService.verifyCallbackData(dto.data);
    } else if (dto.transactionUuid && dto.totalAmount) {
      result = await this.esewaService.verifyByStatus(
        dto.transactionUuid,
        dto.totalAmount,
      );
    } else if (dto.orderId && dto.totalAmount) {
      result = await this.esewaService.verifyByStatus(
        dto.orderId,
        dto.totalAmount,
      );
    } else if (dto.refId && dto.orderId) {
      result = await this.esewaService.verifyPayment(dto.refId, dto.orderId);
    } else {
      return {
        status: 'failure',
        message: 'Provide `data` (callback) or `transactionUuid+totalAmount`',
      };
    }

    const isComplete =
      result.status === 'COMPLETE' || result.status === 'success';
    const txUuid = result.transactionUuid || dto.transactionUuid || dto.orderId;

    // Authorization: ensure caller owns the order (or is admin) before flipping PAID
    if (txUuid && (isComplete || result.status === 'CANCELED')) {
      try {
        const order = await this.ordersService.getOrderById(txUuid);
        if (user.role !== 'ADMIN' && order.customerId !== user.sub) {
          return {
            status: 'failure',
            message: 'Not authorized for this order',
            raw: result,
          };
        }
      } catch (_e) {
        // Order lookup failed – proceed to payment status update which will error gracefully
      }
    }

    if (isComplete && txUuid) {
      try {
        await this.ordersService.updatePaymentStatus(txUuid, 'PAID');
      } catch (_e) {
        // Order may not exist yet if verification called before order creation (race) – log but still return success for payment
      }
    } else if (result.status === 'CANCELED' && txUuid) {
      try {
        await this.ordersService.updatePaymentStatus(txUuid, 'FAILED');
      } catch (_e) {
        // ignore – will be retried by client
      }
    }

    // Normalize to legacy shape for frontend compat
    if (isComplete)
      return {
        status: 'success',
        refId: result.transactionUuid || dto.refId,
        message: 'Payment verified (COMPLETE)',
        raw: result,
      };
    if (result.status === 'PENDING')
      return { status: 'pending', message: 'Payment pending', raw: result };
    return {
      status: 'failure',
      message: result.message || 'Verification failed',
      raw: result,
    };
  }

  // GET verify for redirect handling (eSewa redirects GET with ?data=...)
  @Get('verify')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Verify via GET (eSewa redirect with ?data=)' })
  async verifyGet(
    @CurrentUser() user: JwtPayload,
    @Query('data') data?: string,
    @Query('transaction_uuid') tx?: string,
    @Query('total_amount') amt?: string,
  ) {
    if (data) return this.verify(user, { data });
    if (tx && amt) {
      // Authz: check ownership before marking PAID
      try {
        const order = await this.ordersService.getOrderById(tx);
        if (user.role !== 'ADMIN' && order.customerId !== user.sub) {
          return {
            status: 'failure',
            message: 'Not authorized for this order',
          };
        }
      } catch (_e) {
        // allow status check even if order not found, but PAID flip will fail gracefully
      }
      const r = await this.esewaService.verifyByStatus(tx, amt);
      const isComplete = r.status === 'COMPLETE';
      if (isComplete)
        await this.ordersService
          .updatePaymentStatus(tx, 'PAID')
          .catch(() => {});
      return r;
    }
    return { status: 'failure', message: 'Missing data' };
  }
}
