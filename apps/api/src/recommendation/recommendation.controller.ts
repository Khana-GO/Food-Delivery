import { RecommendationsService } from './recommendation.service';
import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  // ─── PERSONALIZED RECOMMENDATIONS ───
  @Get('personalized')
  @ApiOperation({ summary: 'Get personalized restaurant recommendations' })
  async getPersonalizedRecommendations(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getPersonalizedRecommendations(
      user.sub,
      parseLimit(limit, 10),
    );
  }

  // ─── POPULAR RESTAURANTS ───
  @Get('popular')
  @ApiOperation({ summary: 'Get popular restaurants' })
  async getPopularRestaurants(@Query('limit') limit?: string) {
    return this.recommendationsService.getPopularRestaurants(
      parseLimit(limit, 10),
    );
  }

  // ─── RECENTLY ORDERED ───
  @Get('recently-ordered')
  @ApiOperation({ summary: 'Get recently ordered restaurants' })
  async getRecentlyOrdered(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getRecentlyOrdered(
      user.sub,
      parseLimit(limit, 5),
    );
  }
}

/**
 * Clamp the caller-supplied `limit`.
 *
 * Previously it went straight into `.limit(n)` and into a cache key, so
 * `?limit=1000000` forced an unbounded result set and created an unbounded
 * number of distinct cache entries.
 */
const MAX_RECOMMENDATION_LIMIT = 50;

function parseLimit(raw: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(raw ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.min(parsed, MAX_RECOMMENDATION_LIMIT);
}
