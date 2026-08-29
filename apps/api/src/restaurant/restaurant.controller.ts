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
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { FindRestaurantsDto } from './dto/find-restaurants.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RestaurantsService } from './restaurant.service';
import { RestaurantResponseDto } from './dto/restarurant-response.dto';
import { RestaurantStatsDto } from './dto/restaurant-stats.dto';

@ApiTags('Restaurants')
@ApiBearerAuth()
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new restaurant' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.create(user.sub, dto);
  }

  // ─── STATIC / ADMIN ROUTES — MUST BE BEFORE :id ───

  @Get('cuisines')
  @ApiOperation({ summary: 'Get the fixed list of supported cuisine types' })
  getCuisines(): string[] {
    return this.restaurantsService.getCuisines();
  }

  @Get('my')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get restaurants owned by the current user' })
  async getMyRestaurants(
    @CurrentUser() user: JwtPayload,
  ): Promise<RestaurantResponseDto[]> {
    return this.restaurantsService.findByOwner(user.sub);
  }

  @Get('deleted/all')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all soft-deleted restaurants (Admin only)' })
  async getDeleted(@Query() query: FindRestaurantsDto) {
    return this.restaurantsService.findDeleted({
      page: query.page,
      limit: query.limit,
      search: query.search,
    });
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get restaurant statistics (Admin only)' })
  async getStats(): Promise<RestaurantStatsDto> {
    return this.restaurantsService.getStats();
  }

  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get restaurant statistics overview (Admin only)' })
  async getStatsOverview(): Promise<RestaurantStatsDto> {
    return this.restaurantsService.getStats();
  }

  // ─── FIND ALL ───
  @Get()
  @ApiOperation({ summary: 'Get all restaurants with pagination and filters' })
  async findAll(@Query() query: FindRestaurantsDto) {
    return this.restaurantsService.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      cuisineType: query.cuisineType,
      isOpen: query.isOpen !== undefined ? query.isOpen === 'true' : undefined,
      isVerified: query.isVerified !== undefined ? query.isVerified === 'true' : undefined,
      isActive: query.isActive !== undefined ? query.isActive === 'true' : undefined,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder as any,
    });
  }

  // ─── FIND BY SLUG ─── (must be before :id if using string)
  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get restaurant by slug' })
  async findBySlug(@Param('slug') slug: string): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findBySlug(slug);
  }

  // ─── FIND BY ID ───
  @Get(':id')
  @ApiOperation({ summary: 'Get restaurant by ID' })
  async findById(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findById(id);
  }

  // ─── UPDATE ───
  @Put(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant text details' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.update(id, user, dto);
  }

  // ─── UPLOAD IMAGES ───
  @Post(':id/images')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Upload restaurant images (logo and cover)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
        cover: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async uploadImages(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    const logoFile = files?.logo?.[0];
    const coverFile = files?.cover?.[0];
    if (!logoFile && !coverFile) {
      throw new BadRequestException('At least one image (logo or cover) is required');
    }
    return this.restaurantsService.uploadImages(id, user, logoFile, coverFile);
  }

  @Put(':id/images')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant images (replaces existing images)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        logo: { type: 'string', format: 'binary' },
        cover: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logo', maxCount: 1 },
      { name: 'cover', maxCount: 1 },
    ]),
  )
  async updateImages(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    const logoFile = files?.logo?.[0];
    const coverFile = files?.cover?.[0];
    if (!logoFile && !coverFile) {
      throw new BadRequestException('At least one image (logo or cover) is required');
    }
    return this.restaurantsService.updateImages(id, user, logoFile, coverFile);
  }

  @Delete(':id/logo')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete restaurant logo' })
  @ApiParam({ name: 'id' })
  async deleteLogo(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.deleteImage(id, user, 'logo');
  }

  @Delete(':id/cover')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete restaurant cover image' })
  @ApiParam({ name: 'id' })
  async deleteCover(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.deleteImage(id, user, 'cover');
  }

  // ─── TOGGLES (must be before generic :id delete) ───
  @Patch(':id/toggle-open')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle restaurant open/closed status' })
  async toggleOpen(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ isOpen: boolean }> {
    return this.restaurantsService.toggleOpen(id, user);
  }

  @Patch(':id/toggle-verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle restaurant verification status (Admin only)' })
  async toggleVerification(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ isVerified: boolean }> {
    return this.restaurantsService.toggleVerification(id);
  }

  @Patch(':id/toggle-active')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle restaurant active/inactive status (Admin only)' })
  async toggleActive(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ isActive: boolean }> {
    return this.restaurantsService.toggleActive(id);
  }

  // ─── RESTORE / HARD DELETE — SPECIFIC BEFORE GENERIC DELETE ───
  @Put(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted restaurant (Admin only)' })
  async restore(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.restore(id);
  }

  @Delete(':id/permanent')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Permanently delete restaurant (Admin only)' })
  async hardDelete(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    await this.restaurantsService.hardDelete(id);
    return { message: 'Restaurant permanently deleted' };
  }

  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete restaurant' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.delete(id, user);
  }
}
