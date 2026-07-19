import { Injectable, NotImplementedException } from '@nestjs/common';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  create(createRestaurantDto: CreateRestaurantDto) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  findAll() {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  findOne(id: string) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }

  remove(id: string) {
    throw new NotImplementedException('Restaurant persistence is not implemented');
  }
}
