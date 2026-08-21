import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { DbModule } from './db/database.module';
import { AuthModule } from './auth/auth.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { UsersModule } from './users/users.module';
import { MenuCategoriesModule } from './menu-categories/menu-categories.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { MenuModule } from './menu/menu.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
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
    MenuCategoriesModule,
    OrderModule,
    NotificationModule,
    CloudinaryModule,
    MenuModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
