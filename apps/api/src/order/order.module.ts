import { AddressesModule } from './../addresses/addresses.module';
import { Module, forwardRef } from '@nestjs/common';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { NotificationsModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';
import { SessionsModule } from '../sessions/session.module';
import { TrackingModule } from '../tracking/tracking.module';
import { OrderGateway } from './order.gateway';

@Module({
  imports: [
    AuthModule,
    AddressesModule,
    SessionsModule,
    NotificationsModule,
    forwardRef(() => TrackingModule),
  ],
  controllers: [OrdersController],
  providers: [OrdersService, OrderGateway],
  exports: [OrdersService, OrderGateway],
})
export class OrderModule {}
