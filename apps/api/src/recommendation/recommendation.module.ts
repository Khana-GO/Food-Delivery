import { Module } from '@nestjs/common';
import { RecommendationsController } from './recommendation.controller';
import { RecommendationsService } from './recommendation.service';
import { RedisModule } from '../redis/redis.module';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [RedisModule, SessionsModule],
  controllers: [RecommendationsController],
  providers: [RecommendationsService],
  exports: [RecommendationsService],
})
export class RecommendationsModule {}
