import { Module } from '@nestjs/common';
import { FavoritesController } from './favorites.controller';
import { FavoritesService } from './favorites.service';
import { RedisModule } from '../redis/redis.module';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [RedisModule, SessionsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
