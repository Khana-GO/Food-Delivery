import { Module } from '@nestjs/common';
import { CategoriesController } from './menu-categories.controller';
import { CategoriesService } from './menu-categories.service';
import { SessionsModule } from '../sessions/session.module';

@Module({
  controllers: [CategoriesController],
  imports: [SessionsModule],
  providers: [CategoriesService],
  exports: [CategoriesService],
})
export class CategoriesModule {}
