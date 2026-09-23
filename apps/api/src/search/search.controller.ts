import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Public } from '../auth/decorators/public.decorator';
import {
  SearchService,
  type UnifiedSearchResult,
  type SearchSuggestion,
} from './search.service';

/**
 * Single entry point for customer-facing discovery search.
 *
 * Public on purpose: guests can browse restaurants and menus before signing in
 * (same policy as `GET /restaurants` and `GET /menu-items/featured`).
 */
@ApiTags('Search')
@Controller('search')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({
    summary:
      'Search restaurants and dishes together (relevance ranked, typo tolerant)',
  })
  @ApiQuery({ name: 'q', required: false, example: 'chicken momo' })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'lat', required: false, example: 27.7 })
  @ApiQuery({ name: 'lng', required: false, example: 83.45 })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['all', 'restaurants', 'dishes'],
  })
  async search(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('type') type?: 'all' | 'restaurants' | 'dishes',
  ): Promise<UnifiedSearchResult> {
    const parsedLimit = limit ? Number.parseInt(limit, 10) : 20;
    const parsedLat = lat ? Number.parseFloat(lat) : undefined;
    const parsedLng = lng ? Number.parseFloat(lng) : undefined;

    return this.searchService.search({
      q,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : 20,
      lat: Number.isFinite(parsedLat) ? parsedLat : undefined,
      lng: Number.isFinite(parsedLng) ? parsedLng : undefined,
      type:
        type === 'restaurants' || type === 'dishes' || type === 'all'
          ? type
          : 'all',
    });
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({
    summary:
      'Type-ahead suggestions from real dishes, restaurants and categories',
  })
  @ApiQuery({ name: 'q', required: false, example: 'mom' })
  @ApiQuery({ name: 'limit', required: false, example: 8 })
  async suggestions(
    @Query('q') q?: string,
    @Query('limit') limit?: string,
  ): Promise<{ suggestions: SearchSuggestion[] }> {
    const parsed = limit ? Number.parseInt(limit, 10) : 8;
    const suggestions = await this.searchService.suggest(
      q,
      Number.isFinite(parsed) ? parsed : 8,
    );
    return { suggestions };
  }
}
