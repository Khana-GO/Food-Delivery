import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { KhanaGoAgent } from '../agents/khana-go.agent';
import { RestaurantTools } from '../tools/restaurant.tools';
import { MenuTools } from '../tools/menu.tools';
import { OrderTools } from '../tools/order.tools';
import { DeliveryTools } from '../tools/delivery.tools';
import { CartTools } from '../tools/cart.tools';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { MenuModule } from '../menu/menu.module';
import { OrderModule } from '../order/order.module';
import { TrackingModule } from '../tracking/tracking.module';
import { CartModule } from '../cart/cart.module';
import { SessionsModule } from '../sessions/session.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AddressesModule } from '../addresses/addresses.module';

@Module({
  imports: [
    SessionsModule,
    AuthModule,
    UsersModule,
    AddressesModule,
    RestaurantModule,
    MenuModule,
    OrderModule,
    TrackingModule,
    CartModule,
  ],
  controllers: [AIController],
  providers: [
    AIService,
    KhanaGoAgent,
    RestaurantTools,
    MenuTools,
    OrderTools,
    DeliveryTools,
    CartTools,
  ],
  exports: [AIService],
})
export class AiModule {}
// Keep alias for backwards compat where some files import AIModule
export const AIModule = AiModule;
