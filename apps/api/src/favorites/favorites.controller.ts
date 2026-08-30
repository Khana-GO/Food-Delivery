import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post()
  @ApiOperation({ summary: 'Add restaurant to favorites' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() createFavoriteDto: CreateFavoriteDto,
  ) {
    return this.favoritesService.addToFavorites(user.sub, createFavoriteDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get current user favorites' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.favoritesService.getUserFavorites(user.sub);
  }

  @Get('check/:restaurantId')
  @ApiOperation({ summary: 'Check if restaurant is favorited' })
  async check(
    @CurrentUser() user: JwtPayload,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    const isFav = await this.favoritesService.isFavorite(
      user.sub,
      restaurantId,
    );
    return { isFavorite: isFav };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get favorite by id' })
  findOne(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.favoritesService.findOne(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update favorite (change restaurant)' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFavoriteDto: UpdateFavoriteDto,
  ) {
    return this.favoritesService.update(user.sub, id, updateFavoriteDto);
  }

  @Delete('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Remove favorite by restaurantId' })
  removeByRestaurant(
    @CurrentUser() user: JwtPayload,
    @Param('restaurantId', ParseUUIDPipe) restaurantId: string,
  ) {
    return this.favoritesService.removeFromFavorites(user.sub, restaurantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove favorite by favorite id' })
  remove(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.favoritesService.remove(user.sub, id);
  }
}
