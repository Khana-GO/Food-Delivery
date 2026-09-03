import { Module } from '@nestjs/common';
import { AIController } from './ai.controller';
import { AIService } from './ai.service';
import { KhanaGoAgent } from '../agents/khana-go.agent';
import { RestaurantTools } from '../tools/restaurant.tools';
import { MenuTools } from '../tools/menu.tools';
import { OrderTools } from '../tools/order.tools';
import { DeliveryTools } from '../tools/delivery.tools';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { MenuModule } from '../menu/menu.module';
import { OrderModule } from '../order/order.module';
import { TrackingModule } from '../tracking/tracking.module';
import { SessionsModule } from '../sessions/session.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    SessionsModule,
    AuthModule,
    RestaurantModule,
    MenuModule,
    OrderModule,
    TrackingModule,
  ],
  controllers: [AIController],
  providers: [
    AIService,
    KhanaGoAgent,
    RestaurantTools,
    MenuTools,
    OrderTools,
    DeliveryTools,
  ],
  exports: [AIService],
})
export class AiModule {}
// Keep alias for backwards compat where some files import AIModule
export const AIModule = AiModule;
