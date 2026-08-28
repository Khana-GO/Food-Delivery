import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu.controller';
import { MenuItemsService } from './menu.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
import { SessionsModule } from '../sessions/session.module';
import { NotificationsModule } from '../notification/notification.module';

@Module({
  imports: [CloudinaryModule, SessionsModule, NotificationsModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuModule {}
