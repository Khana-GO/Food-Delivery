import { Module } from '@nestjs/common';
import { EsewaController } from './esewa.controller';
import { EsewaService } from './esewa.service';
import { OrderModule } from '../order/order.module';
import { SessionsModule } from '../sessions/session.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [OrderModule, SessionsModule, CartModule],
  controllers: [EsewaController],
  providers: [EsewaService],
  exports: [EsewaService],
})
export class PaymentModule {}
