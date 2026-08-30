import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { DbModule } from './db/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UsersModule } from './users/users.module';
import { OrderModule } from './order/order.module';
import { NotificationsModule } from './notification/notification.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MenuModule } from './menu/menu.module';
import { CategoriesModule } from './menu-categories/menu-categories.module';
import { SessionsModule } from './sessions/session.module';
// import { TrackingModule } from './tracking/tracking.module';
import { FavoritesModule } from './favorites/favorites.module';
import { RecommendationsModule } from './recommendation/recommendation.module';
import { DashboardModule } from './dasboard/dasboard.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Redis must be imported before modules that use CacheService / REDIS_CLIENT
    RedisModule,
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60_000,
        limit: 100, // 100 req / 60s globally — stricter per-route via @Throttle()
      },
    ]),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService): JwtModuleOptions => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret || secret.length < 32) {
          throw new Error(
            'JWT_SECRET must be set to a value of at least 32 characters',
          );
        }
        const expiresIn = config.get<string | number>('JWT_EXPIRES_IN') ?? '1h';
        return {
          secret,
          signOptions: { expiresIn: expiresIn as SignOptions['expiresIn'] },
        };
      },
    }),
    DbModule,
    AuthModule,
    RestaurantModule,
    UsersModule,
    CategoriesModule,
    OrderModule,
    NotificationsModule,
    CloudinaryModule,
    MenuModule,
    SessionsModule,
    // TrackingModule,
    FavoritesModule,
    RecommendationsModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Global throttler: respects @Throttle() overrides per-route. For true distributed
    // Redis-backed limiting, the critical auth routes use Redis RateLimitGuard explicitly.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
