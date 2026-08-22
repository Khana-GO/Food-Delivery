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
  BadRequestException,
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
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm/sql/expressions/conditions';

@ApiTags('Categories')
@ApiBearerAuth()
@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Create a new menu category' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const restaurantId = await this.getRestaurantId(user.sub);
    return this.categoriesService.create(restaurantId, dto);
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto);
  }

  // ─── DELETE ───
  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete category' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.categoriesService.delete(id);
  }

  // ─── Helper ───
  private async getRestaurantId(userId: string): Promise<string> {
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(schema.restaurantsTable.ownerId, userId),
    });

    if (!restaurant) {
      throw new BadRequestException('You do not have a restaurant registered');
    }

    return restaurant.id;
  }
}
