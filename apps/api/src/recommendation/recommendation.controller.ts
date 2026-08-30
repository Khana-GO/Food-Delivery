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
      limit ? parseInt(limit, 10) : 10,
    );
  }

  // ─── POPULAR RESTAURANTS ───
  @Get('popular')
  @ApiOperation({ summary: 'Get popular restaurants' })
  async getPopularRestaurants(@Query('limit') limit?: string) {
    return this.recommendationsService.getPopularRestaurants(
      limit ? parseInt(limit, 10) : 10,
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
      limit ? parseInt(limit, 10) : 5,
    );
  }
}
