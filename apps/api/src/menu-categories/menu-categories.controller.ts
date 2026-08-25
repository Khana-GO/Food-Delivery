import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoryResponseDto } from './dto/category-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { CategoriesService } from './menu-categories.service';
import { CreateCategoryDto } from './dto/create-menu-category.dto';
import { UpdateCategoryDto } from './dto/update-menu-category.dto';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Resolves the restaurant owned by the requester when they are a
   * restaurant owner. Used to scope mutations to their own restaurant.
   * Admins bypass ownership scoping.
   */
  private async resolveOwnerScope(
    user: JwtPayload,
  ): Promise<string | undefined> {
    if (user.role !== UserRole.RESTAURANT_OWNER) {
      return undefined;
    }
    return this.categoriesService.getRestaurantIdByUserId(user.sub);
  }

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Create a new menu category' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const restaurantId = await this.categoriesService.getRestaurantIdByUserId(
      user.sub,
    );
    return this.categoriesService.create(restaurantId, dto);
  }

  // ─── MY CATEGORIES ───
  @Get('my')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({
    summary: "Get categories for the authenticated owner's restaurant",
  })
  async findMine(
    @CurrentUser() user: JwtPayload,
    @Query('includeItemCount') includeItemCount?: string,
  ): Promise<CategoryResponseDto[]> {
    // Same resolution as create/update/delete → reads can never
    // point at a different restaurant than writes.
    const restaurantId = await this.categoriesService.getRestaurantIdByUserId(
      user.sub,
    );
    return this.categoriesService.findByRestaurant(
      restaurantId,
      includeItemCount === 'true',
    );
  }

  // ─── GET ALL (By Restaurant) ───
  @Get('restaurant/:restaurantId')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get all categories for a restaurant' })
  async findByRestaurant(
    @Param('restaurantId', new ParseUUIDPipe()) restaurantId: string,
    @Query('includeItemCount') includeItemCount?: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findByRestaurant(
      restaurantId,
      includeItemCount === 'true',
    );
  }

  // ─── GET BY ID ───
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get category by ID' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.findById(id);
  }

  // ─── UPDATE ───
  @Put(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update category' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const ownerRestaurantId = await this.resolveOwnerScope(user);
    return this.categoriesService.update(id, dto, ownerRestaurantId);
  }

  // ─── DELETE ───
  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    const ownerRestaurantId = await this.resolveOwnerScope(user);
    return this.categoriesService.delete(id, ownerRestaurantId);
  }
}
