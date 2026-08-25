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
} from '@nestjs/swagger';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { RestaurantsService } from './restaurant.service';
import { RestaurantResponseDto } from './dto/restarurant-response.dto';

@ApiTags('Restaurants')
@ApiBearerAuth()
@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Create a new restaurant' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateRestaurantDto,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.create(user.sub, dto);
  }

  // ─── FIND ALL ───
  @Get()
  // @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get all restaurants with pagination and filters' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('cuisineType') cuisineType?: string,
    @Query('isOpen') isOpen?: string,
    @Query('isVerified') isVerified?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.restaurantsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      cuisineType,
      isOpen: isOpen ? isOpen === 'true' : undefined,
      isVerified: isVerified ? isVerified === 'true' : undefined,
      sortBy,
      sortOrder,
    });
  }

  // ─── AVAILABLE CUISINE TYPES ───
  @Get('cuisines')
  @ApiOperation({ summary: 'Get the fixed list of supported cuisine types' })
  getCuisines(): string[] {
    return this.restaurantsService.getCuisines();
  }

  // ─── MY RESTAURANTS ───
  @Get('my')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get restaurants owned by the current user' })
  async getMyRestaurants(
    @CurrentUser() user: JwtPayload,
  ): Promise<RestaurantResponseDto[]> {
    return this.restaurantsService.findByOwner(user.sub);
  }

  // ─── FIND BY ID ───
  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER, UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get restaurant by ID' })
  async findById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findById(id);
  }

  // ─── FIND BY SLUG ───
  @Get('slug/:slug')
  @Roles(UserRole.ADMIN, UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get restaurant by slug' })
  async findBySlug(
    @Param('slug') slug: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.findBySlug(slug);
  }

  // ─── UPDATE ───
  @Put(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update restaurant text details' })
  async update(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    const logoFile = files?.logo?.[0];
    const coverFile = files?.cover?.[0];

    if (!logoFile && !coverFile) {
      throw new BadRequestException(
        'At least one image (logo or cover) is required',
      );
    }

    return this.restaurantsService.uploadImages(id, user, logoFile, coverFile);
  }

  // ─── UPDATE IMAGES ───
  @Put(':id/images')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Update restaurant images (replaces existing images)',
  })
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
    @Param('id', new ParseUUIDPipe()) id: string,
    @UploadedFiles()
    files?: { logo?: Express.Multer.File[]; cover?: Express.Multer.File[] },
  ): Promise<{ logoUrl?: string; coverImageUrl?: string }> {
    const logoFile = files?.logo?.[0];
    const coverFile = files?.cover?.[0];

    if (!logoFile && !coverFile) {
      throw new BadRequestException(
        'At least one image (logo or cover) is required',
      );
    }

    return this.restaurantsService.updateImages(id, user, logoFile, coverFile);
  }

  // ─── DELETE LOGO ───
  @Delete(':id/logo')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete restaurant logo' })
  async deleteLogo(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.deleteImage(id, user, 'logo');
  }

  // ─── DELETE COVER ───
  @Delete(':id/cover')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete restaurant cover image' })
  async deleteCover(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.deleteImage(id, user, 'cover');
  }

  // ─── TOGGLE OPEN ───
  @Patch(':id/toggle-open')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Toggle restaurant open/closed status' })
  async toggleOpen(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ isOpen: boolean }> {
    return this.restaurantsService.toggleOpen(id, user);
  }

  // ─── TOGGLE VERIFICATION ───
  @Patch(':id/toggle-verify')
  @Roles(UserRole.ADMIN)
  @ApiOperation({
    summary: 'Toggle restaurant verification status (Admin only)',
  })
  async toggleVerification(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ isVerified: boolean }> {
    return this.restaurantsService.toggleVerification(id);
  }

  // ─── SOFT DELETE ───
  @Delete(':id')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft delete restaurant' })
  async delete(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ message: string }> {
    return this.restaurantsService.delete(id, user);
  }

  // ─── RESTORE ───
  @Put(':id/restore')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Restore a soft-deleted restaurant (Admin only)' })
  async restore(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<RestaurantResponseDto> {
    return this.restaurantsService.restore(id);
  }
}
