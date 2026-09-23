import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardResponseDto } from './dto/dashboard-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { DashboardService } from './dasboard.service';

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get customer dashboard data' })
  async getDashboard(
    @CurrentUser() user: JwtPayload,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
  ): Promise<DashboardResponseDto> {
    const parsedLat = lat ? Number.parseFloat(lat) : undefined;
    const parsedLng = lng ? Number.parseFloat(lng) : undefined;
    const origin =
      Number.isFinite(parsedLat) && Number.isFinite(parsedLng)
        ? { lat: parsedLat as number, lng: parsedLng as number }
        : null;

    return this.dashboardService.getDashboard(user.sub, origin);
  }
}
