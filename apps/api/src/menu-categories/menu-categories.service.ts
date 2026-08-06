import { Injectable } from '@nestjs/common';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Injectable()
export class MenuCategoriesService {
  create(createMenuCategoryDto: CreateMenuCategoryDto) {
    return 'This action adds a new menuCategory';
  }

  findAll() {
    return `This action returns all menuCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} menuCategory`;
  }

  update(id: number, updateMenuCategoryDto: UpdateMenuCategoryDto) {
    return `This action updates a #${id} menuCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} menuCategory`;
  }
}
