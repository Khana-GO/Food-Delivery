import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('restaurant/:id')
  // We make this public (no auth guards) or accessible to all valid users since customers need to see the menu.
  getMenuForRestaurant(@Param('id', ParseUUIDPipe) id: string) {
    return this.menuService.getMenuForRestaurant(id);
  }
}
