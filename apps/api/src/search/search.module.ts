import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { RestaurantModule } from '../restaurant/restaurant.module';
import { MenuModule } from '../menu/menu.module';
import { SessionsModule } from '../sessions/session.module';

/**
 * Composes the existing restaurant and menu search rather than duplicating it —
 * there is a single relevance engine and a single catalogue source of truth.
 */
@Module({
  imports: [RestaurantModule, MenuModule, SessionsModule],
  controllers: [SearchController],
  providers: [SearchService],
  exports: [SearchService],
})
export class SearchModule {}
