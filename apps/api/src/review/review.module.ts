import { Module } from '@nestjs/common';
import { ReviewsController } from './review.controller';
import { ReviewsService } from './review.service';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [SessionsModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
