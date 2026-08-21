import { restaurantsTable, RestaurantsTable } from './../db/schema/restaurant.schema';
import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CreateMenuItemDto } from './dto/create-menu.dto';
import { UpdateMenuItemDto } from './dto/update-menu.dto';
import { MenuItemsService } from './menu.service';
import { eq } from 'drizzle-orm/sql';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';

@ApiTags('Menu Items')
@ApiBearerAuth()
@Controller('menu-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuItemsController {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Create a new menu item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Chicken Momo' },
        description: { type: 'string', example: 'Steamed chicken dumplings' },
        price: { type: 'number', example: 299.0 },
        categoryId: { type: 'string', example: 'category-uuid' },
        isAvailable: { type: 'boolean', example: true },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MenuItemResponseDto> {
    // Get restaurant ID from user's restaurant
    const restaurantId = await this.getRestaurantId(user.sub);
    return this.menuItemsService.create(restaurantId, dto, file);
  }

  // ─── GET ALL (By Restaurant) ───
  @Get('restaurant/:restaurantId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  async findByRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('isAvailable') isAvailable?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.menuItemsService.findByRestaurant(restaurantId, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      categoryId,
      isAvailable: isAvailable ? isAvailable === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  // ─── GET GROUPED BY CATEGORY ───
  @Get('restaurant/:restaurantId/grouped')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get menu items grouped by category' })
  async getGroupedByCategory(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
  ) {
    return this.menuItemsService.getGroupedByCategory(restaurantId);
  }

  // ─── GET BY CATEGORY ───
  @Get('category/:categoryId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get menu items by category' })
  async findByCategory(
    @Param('categoryId', new ParseUUIDPipe()) categoryId: string,
    @Query('isAvailable') isAvailable?: string,
  ) {
    return this.menuItemsService.findByCategory(
      categoryId,
      isAvailable ? isAvailable === 'true' : undefined,
    );
  }

  // ─── GET BY ID ───
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get menu item by ID' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.findById(id);
  }

  // ─── UPDATE ───
  @Put(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update menu item' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'Chicken Momo' },
        description: { type: 'string', example: 'Steamed chicken dumplings' },
        price: { type: 'number', example: 299.0 },
        categoryId: { type: 'string', example: 'category-uuid' },
        isAvailable: { type: 'boolean', example: true },
        image: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('image'))
  async update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MenuItemResponseDto> {
    return this.menuItemsService.update(id, dto, file);
  }

  // ─── TOGGLE AVAILABILITY ───
  @Patch(':id/toggle-availability')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle menu item availability' })
  async toggleAvailability(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ isAvailable: boolean }> {
    return this.menuItemsService.toggleAvailability(id);
  }

  // ─── DELETE ───
  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu item' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.menuItemsService.delete(id);
  }

  // ─── BULK CREATE ───
  @Post('bulk')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Bulk create menu items' })
  async bulkCreate(
    @CurrentUser() user: JwtPayload,
    @Body() items: CreateMenuItemDto[],
  ): Promise<MenuItemResponseDto[]> {
    const restaurantId = await this.getRestaurantId(user.sub);
    return this.menuItemsService.bulkCreate(restaurantId, items);
  }

  // ─── BULK DELETE ───
  @Delete('bulk')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk delete menu items' })
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body('ids') ids: string[],
  ): Promise<{ message: string; deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Please provide at least one ID');
    }
    return this.menuItemsService.bulkDelete(ids);
  }

  // ─── Helper ───
  // In MenuItemsController, replace the placeholder method with:

  private async getRestaurantId(userId: string): Promise<string> {
    // Option 1: If the user has a "restaurantId" field
    // const user = await this.usersService.findById(userId);
    // return user.restaurantId;

    // Option 2: Find restaurant by ownerId
    const restaurant = await this.db.restaurantsTable.findFirst({
      where: eq(RestaurantsTable.ownerId, userId),
    });

    if (!restaurant) {
      throw new BadRequestException('You do not have a restaurant registered');
    }

    return restaurant.id;
  }
}
