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
   * Returns the owner's userId for ownership checks (multi-restaurant aware).
   * Admins bypass scoping by returning undefined.
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
  @ApiOperation({ summary: 'Create a new menu category' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateCategoryDto,
  ): Promise<CategoryResponseDto> {
    // Explicit selection (multi-restaurant owners) is ownership-checked;
    // otherwise fall back to the owner's default restaurant.
    const restaurantId = dto.restaurantId
      ? await this.categoriesService.getOwnedRestaurantId(
          user.sub,
          dto.restaurantId,
        )
      : await this.categoriesService.getRestaurantIdByUserId(user.sub);
    return this.categoriesService.create(restaurantId, dto, user.sub);
  }

  // ─── MY CATEGORIES ─── (legacy: oldest restaurant only)
  @Get('my')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({
    summary: "Get categories for the authenticated owner's restaurant (oldest)",
  })
  async findMine(
    @CurrentUser() user: JwtPayload,
    @Query('includeItemCount') includeItemCount?: string,
  ): Promise<CategoryResponseDto[]> {
    const restaurantId = await this.categoriesService.getRestaurantIdByUserId(
      user.sub,
    );
    return this.categoriesService.findByRestaurant(
      restaurantId,
      includeItemCount === 'true',
    );
  }

  // ─── ALL OWNER CATEGORIES (all restaurants) ───
  @Get('my/all')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({
    summary: "Get all categories across all restaurants owned by the user",
  })
  async findAllForOwner(
    @CurrentUser() user: JwtPayload,
    @Query('includeItemCount') includeItemCount?: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAllForOwner(
      user.sub,
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
    const ownerUserId = this.resolveOwnerScope(user);
    return this.categoriesService.update(id, dto, ownerUserId);
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
    const ownerUserId = this.resolveOwnerScope(user);
    return this.categoriesService.delete(id, ownerUserId);
  }
}
