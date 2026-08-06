import { Module } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { MenuCategoriesController } from './menu-categories.controller';

@Module({
  controllers: [MenuCategoriesController],
  providers: [MenuCategoriesService],
})
export class MenuCategoriesModule {}
