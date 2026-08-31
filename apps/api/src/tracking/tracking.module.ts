import { Module, forwardRef } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { TrackingGateway } from './tracking.gateway';
import { TrackingController } from './tracking.controller';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [SessionsModule],
  controllers: [TrackingController],
  providers: [TrackingGateway, TrackingService],
  exports: [TrackingService, TrackingGateway],
})
export class TrackingModule {}
