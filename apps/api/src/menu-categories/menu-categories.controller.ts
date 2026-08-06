import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MenuCategoriesService } from './menu-categories.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Controller('menu-categories')
export class MenuCategoriesController {
  constructor(private readonly menuCategoriesService: MenuCategoriesService) {}

  @Post()
  create(@Body() createMenuCategoryDto: CreateMenuCategoryDto) {
    return this.menuCategoriesService.create(createMenuCategoryDto);
  }

  @Get()
  findAll() {
    return this.menuCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMenuCategoryDto: UpdateMenuCategoryDto) {
    return this.menuCategoriesService.update(+id, updateMenuCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuCategoriesService.remove(+id);
  }
}
