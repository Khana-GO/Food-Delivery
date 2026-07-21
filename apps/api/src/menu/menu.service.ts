import { Injectable, Inject, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class MenuService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  create(createMenuDto: CreateMenuDto) {
    throw new NotImplementedException('Menu persistence is not implemented');
  }

  // Get categories and their items for a specific restaurant
  async getMenuForRestaurant(restaurantId: string) {
    const categories = await this.db.query.menuCategoriesTable.findMany({
      where: eq(schema.menuCategoriesTable.restaurantId, restaurantId),
    });

    const items = await this.db.query.menuItemsTable.findMany({
      where: eq(schema.menuItemsTable.restaurantId, restaurantId),
    });

    return { categories, items };
  }

  update(id: number, updateMenuDto: UpdateMenuDto) {
    throw new NotImplementedException('Menu persistence is not implemented');
  }

  remove(id: number) {
    throw new NotImplementedException('Menu persistence is not implemented');
  }
}
