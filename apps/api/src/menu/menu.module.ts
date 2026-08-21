import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu.controller';
import { MenuItemsService } from './menu.service';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';

@Module({
  imports: [CloudinaryModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService],
  exports: [MenuItemsService],
})
export class MenuModule {}
