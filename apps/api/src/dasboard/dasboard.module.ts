import { Module } from '@nestjs/common';
import { DashboardController } from './dasboard.controller';
import { DashboardService } from './dasboard.service';
import { UsersModule } from '../users/users.module';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { CategoriesModule } from '../menu-categories/menu-categories.module';
import { RecommendationsModule } from '../recommendation/recommendation.module';
import { FavoritesModule } from '../favorites/favorites.module';
import { SessionsModule } from '../sessions/session.module';

@Module({
  imports: [
    UsersModule,
    RestaurantModule,
    CategoriesModule,
    RecommendationsModule,
    FavoritesModule,
    SessionsModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
