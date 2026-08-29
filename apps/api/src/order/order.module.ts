import { Module } from '@nestjs/common';
import { OrdersService } from './order.service';
import { OrdersController } from './order.controller';
import { NotificationsModule } from '../notification/notification.module';
import { AuthModule } from '../auth/auth.module';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [AuthModule, SessionsModule, NotificationsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrderModule {}
