import { Injectable, Inject, NotFoundException, NotImplementedException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';

@Injectable()
export class RestaurantService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  create(createRestaurantDto: CreateRestaurantDto) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  async findAll() {
    return await this.db.query.restaurantsTable.findMany({
      where: eq(schema.restaurantsTable.isActive, true),
      with: {
        // We can add relationships if needed (e.g. owner info or categories)
      }
    });
  }

  async findOne(id: string) {
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(schema.restaurantsTable.id, id),
    });

    if (!restaurant) {
      throw new NotFoundException(`Restaurant with ID ${id} not found`);
    }
    
    return restaurant;
  }

  update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  remove(id: string) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }
}
