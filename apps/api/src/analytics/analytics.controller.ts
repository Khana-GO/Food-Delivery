import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@food_delivery/types';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('platform')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get platform-wide metrics' })
  async getPlatformMetrics() {
    return this.analyticsService.getPlatformMetrics();
  }

  @Get('restaurants')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get restaurant analytics' })
  async getRestaurantAnalytics(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.analyticsService.getRestaurantAnalytics(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      sortBy || 'totalOrders',
      sortOrder || 'DESC',
    );
  }

  @Get('drivers')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get driver analytics' })
  async getDriverAnalytics(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('sortOrder') sortOrder?: 'ASC' | 'DESC',
  ) {
    return this.analyticsService.getDriverAnalytics(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
      sortBy || 'totalDeliveries',
      sortOrder || 'DESC',
    );
  }
}
