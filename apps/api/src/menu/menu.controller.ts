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

@ApiTags('Menu Items')
@ApiBearerAuth()
@Controller('menu-items')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  /**
   * Returns owner userId for multi-restaurant-aware ownership check.
   * Admins bypass by returning undefined.
   */
  private resolveOwnerScope(user: JwtPayload): string | undefined {
    if (user.role !== UserRole.RESTAURANT_OWNER) {
      return undefined;
    }
    return user.sub;
  }

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
    // Explicit selection (multi-restaurant owners) is ownership-checked;
    // otherwise fall back to the owner's default restaurant.
    const restaurantId = dto.restaurantId
      ? await this.menuItemsService.getOwnedRestaurantId(
          user.sub,
          dto.restaurantId,
        )
      : await this.menuItemsService.getRestaurantIdForUser(user.sub);
    return this.menuItemsService.create(restaurantId, dto, file, user.sub);
  }

  // ─── GET ALL (By Restaurant) ───
  @Get('restaurant/:restaurantId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get all menu items for a restaurant' })
  findByRestaurant(
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

  // ─── GET FEATURED (only approved restaurants) ───
  @Get('featured')
  @Roles(
    UserRole.CUSTOMER,
    UserRole.ADMIN,
    UserRole.RESTAURANT_OWNER,
    UserRole.DRIVER,
  )
  @ApiOperation({
    summary: 'Get featured menu items from approved restaurants',
  })
  getFeatured(@Query('limit') limit?: string) {
    return this.menuItemsService.getFeatured(limit ? parseInt(limit, 10) : 12);
  }

  // ─── GET GROUPED BY CATEGORY ───
  @Get('restaurant/:restaurantId/grouped')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get menu items grouped by category' })
  getGroupedByCategory(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
  ) {
    return this.menuItemsService.getGroupedByCategory(restaurantId);
  }

  // ─── GET BY CATEGORY ───
  @Get('category/:categoryId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get menu items by category' })
  findByCategory(
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

  // ─── BULK CREATE ───
  @Post('bulk')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Bulk create menu items' })
  async bulkCreate(
    @CurrentUser() user: JwtPayload,
    @Body() items: CreateMenuItemDto[],
  ): Promise<MenuItemResponseDto[]> {
    const restaurantId = await this.menuItemsService.getRestaurantIdForUser(
      user.sub,
    );
    return this.menuItemsService.bulkCreate(restaurantId, items);
  }

  // ─── BULK DELETE ───
  // Declared before `:id` routes so "bulk" is not captured as an id param
  @Delete('bulk')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Bulk delete menu items' })
  @HttpCode(HttpStatus.OK)
  bulkDelete(
    @CurrentUser() user: JwtPayload,
    @Body('ids') ids: string[],
  ): Promise<{ message: string; deleted: number }> {
    if (!ids || ids.length === 0) {
      throw new BadRequestException('Please provide at least one ID');
    }
    const ownerUserId = this.resolveOwnerScope(user);
    return this.menuItemsService.bulkDelete(ids, ownerUserId);
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
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateMenuItemDto,
    @UploadedFile() file?: Express.Multer.File,
  ): Promise<MenuItemResponseDto> {
    const ownerUserId = this.resolveOwnerScope(user);
    return this.menuItemsService.update(id, dto, file, ownerUserId);
  }

  // ─── TOGGLE AVAILABILITY ───
  @Patch(':id/toggle-availability')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle menu item availability' })
  async toggleAvailability(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ isAvailable: boolean }> {
    const ownerUserId = this.resolveOwnerScope(user);
    return this.menuItemsService.toggleAvailability(id, ownerUserId);
  }

  // ─── DELETE ───
  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete menu item' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    const ownerUserId = this.resolveOwnerScope(user);
    return this.menuItemsService.delete(id, ownerUserId);
  }
}
