import { Module } from '@nestjs/common';
import { CategoriesController } from './menu-categories.controller';
import { CategoriesService } from './menu-categories.service';

@Module({
  controllers: [CategoriesController],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
