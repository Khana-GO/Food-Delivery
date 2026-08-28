import { CloudinaryModule } from './../cloudinary/cloudinary.module';
import { Module, forwardRef } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SessionsModule } from '../sessions/session.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { NotificationsModule } from '../notification/notification.module';

@Module({
  imports: [
    forwardRef(() => AuthModule),
    SessionsModule,
    CloudinaryModule,
    NotificationsModule,
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
