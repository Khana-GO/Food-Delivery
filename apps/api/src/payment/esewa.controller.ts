import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EsewaService } from './esewa.service';
import { OrdersService } from '../order/order.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { EsewaInitDto } from './dto/esewa-init.dto';
import { EsewaVerifyDto } from './dto/esewa-verify.dto';
import { EsewaVerifyAndCreateDto } from './dto/esewa-verify-and-create.dto';
import { CreateOrderDto, PaymentMethod } from '../order/dto/create-order.dto';
import { CartService } from '../cart/cart.service';

@ApiTags('Payment - eSewa v2')
@Controller('payment/esewa')
export class EsewaController {
  constructor(
    private readonly esewaService: EsewaService,
    private readonly ordersService: OrdersService,
    private readonly cartService: CartService,
  ) {}

  @Post('initialize')
  @ApiOperation({ summary: 'Initialize eSewa payment (v2 form)' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  async initialize(@CurrentUser() user: JwtPayload, @Body() dto: EsewaInitDto) {
    // Pre-payment flow: no orderId, just amount + transactionUuid.
    // Legacy flow: orderId + amount (order already exists).
    if (dto.orderId) {
      // Legacy flow – load the order server-side for amount + ownership check
      const order = await this.ordersService.getOrderById(dto.orderId);
      if (!order) throw new BadRequestException('Order not found');
      if (user.role !== 'ADMIN' && order.customerId !== user.sub) {
        throw new ForbiddenException('Not authorized for this order');
      }
      if (order.paymentStatus === 'PAID') {
        throw new BadRequestException('Order is already paid');
      }
      return this.esewaService.initializePayment({
        orderId: order.id,
        amount: Number(order.totalAmount),
        productName: 'KhanaGo Order',
      });
    }

    // Pre-payment flow: amount + transactionUuid
    if (!dto.transactionUuid) {
      throw new BadRequestException('Provide orderId or transactionUuid');
    }
    return this.esewaService.initializePayment({
      amount: dto.amount,
      productName: 'KhanaGo Order',
      transactionUuid: dto.transactionUuid,
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
      // Paying customer's cart is consumed – clear it server-side so
      // duplicated/stale items never ship even if the client fails to call.
      try {
        const order = await this.ordersService.getOrderById(txUuid);
        if (order && (user.role === 'ADMIN' || order.customerId === user.sub)) {
          await this.cartService.clearCart(order.customerId);
        }
      } catch (_e) {
        // ignore – client also clears; failure here is non-fatal
      }
    }
    // NOTE: We deliberately do NOT auto-mark an order FAILED from client-side
    // eSewa verification. The callback/redirect status (CANCELED) is unreliable
    // in the RC sandbox and a canceled report must never overwrite a payment
    // that may have actually succeeded. Confirmed cancellations stay PENDING
    // until reconciled manually/admin.

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
      if (isComplete) {
        await this.ordersService
          .updatePaymentStatus(tx, 'PAID')
          .catch(() => {});
        try {
          const order = await this.ordersService.getOrderById(tx);
          if (order && (user.role === 'ADMIN' || order.customerId === user.sub))
            await this.cartService.clearCart(order.customerId);
        } catch (_e) {
          // ignore
        }
      }
      return r;
    }
    return { status: 'failure', message: 'Missing data' };
  }

  // ─── NEW: Verify payment AND create order in one step ───
  // This is the pre-payment flow: order does NOT exist when the user is
  // redirected to eSewa. After the callback data is received the client
  // posts here with the original order payload so the backend can verify
  // the payment and atomically create the order as PAID.
  @Post('verify-and-create')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Verify eSewa payment and create the order as PAID (pre-payment flow)',
  })
  async verifyAndCreate(
    @CurrentUser() user: JwtPayload,
    @Body() dto: EsewaVerifyAndCreateDto,
  ) {
    // 1. Verify payment via callback data (authoritative status check is inside)
    let result: any;
    if (dto.data) {
      result = await this.esewaService.verifyCallbackData(dto.data);
    } else if (dto.transactionUuid && dto.totalAmount) {
      // Fallback: no callback data, use status API with transactionUuid + amount
      result = await this.esewaService.verifyByStatus(
        dto.transactionUuid,
        dto.totalAmount,
      );
    } else {
      return {
        status: 'failure',
        message: 'Provide callback data or transactionUuid+totalAmount',
      };
    }

    const isComplete =
      result.status === 'COMPLETE' || result.status === 'success';
    const txUuid = result.transactionUuid || dto.transactionUuid;

    if (!isComplete) {
      // Payment not successful – do NOT create an order. Return the status
      // so the frontend can show the appropriate failure/pending page.
      return {
        status: result.status === 'PENDING' ? 'pending' : 'failure',
        message: result.message || 'Payment not completed',
        transactionUuid: txUuid,
      };
    }

    // 2. Payment COMPLETE – create the order as PAID.
    //    The verified amount from the gateway is cross-checked against the
    //    server-recomputed order total inside createPaidOrder so a small
    //    transaction can never be redeemed for a larger order.
    const orderPayload: CreateOrderDto = {
      restaurantId: dto.restaurantId,
      addressId: dto.addressId,
      items: dto.items,
      notes: dto.notes,
      promoCode: dto.promoCode,
      paymentMethod: PaymentMethod.ONLINE,
      paymentId: `esewa-${txUuid}`,
    };

    const verifiedAmount =
      result.totalAmount != null && String(result.totalAmount).trim() !== ''
        ? Number(result.totalAmount)
        : undefined;

    // A paid order must never be created without a usable, gateway-derived
    // amount. Previously an absent/non-numeric amount silently disabled the
    // cross-check inside createPaidOrder, allowing a forged callback to buy an
    // arbitrarily large order with a tiny payment.
    if (
      verifiedAmount === undefined ||
      !Number.isFinite(verifiedAmount) ||
      verifiedAmount <= 0
    ) {
      return {
        status: 'failure',
        message:
          'Payment verified but the amount could not be established. Please contact support.',
        transactionUuid: txUuid,
      };
    }

    const order = await this.ordersService.createPaidOrder(
      user.sub,
      orderPayload,
      `esewa-${txUuid}`,
      verifiedAmount,
    );

    // 3. Clear the customer's cart (payment succeeded)
    try {
      await this.cartService.clearCart(user.sub);
    } catch (_e) {
      // non-fatal – client also clears
    }

    return {
      status: 'success',
      message: 'Payment verified and order created (PAID)',
      order,
      transactionUuid: txUuid,
    };
  }
}
