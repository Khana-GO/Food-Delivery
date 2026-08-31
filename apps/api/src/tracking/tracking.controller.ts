import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  ParseUUIDPipe,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { TrackingService } from './tracking.service';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { TrackingGateway } from './tracking.gateway';

@ApiTags('Tracking')
@ApiBearerAuth()
@Controller('tracking')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TrackingController {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly trackingGateway: TrackingGateway,
  ) {}

  // ─── UPDATE DRIVER LOCATION (REST fallback, WS preferred) ───
  @Post('location')
  @Roles(UserRole.DRIVER, UserRole.ADMIN)
  @Throttle({ default: { limit: 30, ttl: 60_000 } }) // 30 req/min per driver
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update driver location (throttled 30/min, prefer WS)',
  })
  async updateLocation(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateLocationDto,
  ) {
    const result = await this.trackingService.updateDriverLocation(
      user.sub,
      dto,
    );

    await this.trackingGateway.broadcastDriverLocation(dto.orderId, {
      orderId: dto.orderId,
      driverId: user.sub,
      latitude: dto.latitude,
      longitude: dto.longitude,
      accuracy: dto.accuracy,
      speed: dto.speed,
      heading: dto.heading,
      altitude: (dto as any).altitude,
      timestamp: result.lastUpdatedAt.toISOString(),
      isOnline: result.isOnline,
    });

    // Also broadcast ETA if route recalculated
    const eta = await this.trackingService.getEtaForOrder(dto.orderId);
    if (eta) {
      await this.trackingGateway.broadcastEtaUpdate(dto.orderId, eta);
    }

    return result;
  }

  // ─── GET DRIVER LOCATION ───
  @Get('location/:orderId')
  @ApiOperation({
    summary: 'Get current driver location for an order (authz enforced)',
  })
  async getDriverLocation(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', new ParseUUIDPipe({ version: '4' })) orderId: string,
  ) {
    await this.trackingService.assertCanAccessOrder(
      orderId,
      user.sub,
      user.role!,
    );
    return this.trackingService.getDriverLocation(orderId);
  }

  // ─── GET LOCATION HISTORY ───
  @Get('location/:orderId/history')
  @ApiOperation({ summary: 'Get driver location history for an order' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getLocationHistory(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', new ParseUUIDPipe({ version: '4' })) orderId: string,
    @Query('limit') limit?: string,
  ) {
    await this.trackingService.assertCanAccessOrder(
      orderId,
      user.sub,
      user.role!,
    );
    const n = limit ? Math.min(parseInt(limit, 10) || 50, 200) : 50;
    return this.trackingService.getDriverLocationHistory(orderId, n);
  }

  // ─── GET ORDER TRACKING SNAPSHOT (advanced) ───
  @Get('order/:orderId')
  @ApiOperation({
    summary:
      'Get complete order tracking snapshot (driver+route+restaurant+delivery)',
  })
  async getOrderTrackingData(
    @CurrentUser() user: JwtPayload,
    @Param('orderId', new ParseUUIDPipe({ version: '4' })) orderId: string,
  ): Promise<any> {
    // Permission enforced inside service
    return this.trackingService.getOrderTrackingData(
      orderId,
      user.sub,
      user.role,
    );
  }

  // ─── CALCULATE ROUTE ───
  @Get('route/calculate')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  @ApiOperation({ summary: 'Calculate route between two points (cached 5min)' })
  @ApiQuery({ name: 'startLat', type: String })
  @ApiQuery({ name: 'startLng', type: String })
  @ApiQuery({ name: 'endLat', type: String })
  @ApiQuery({ name: 'endLng', type: String })
  async calculateRoute(
    @Query('startLat') startLat: string,
    @Query('startLng') startLng: string,
    @Query('endLat') endLat: string,
    @Query('endLng') endLng: string,
  ) {
    return this.trackingService.calculateRoute(
      parseFloat(startLat),
      parseFloat(startLng),
      parseFloat(endLat),
      parseFloat(endLng),
    );
  }

  // Legacy alias to keep old frontend working
  @Get('route')
  @ApiOperation({ summary: 'Calculate route (legacy alias)' })
  async calculateRouteLegacy(
    @Query('startLat') startLat: string,
    @Query('startLng') startLng: string,
    @Query('endLat') endLat: string,
    @Query('endLng') endLng: string,
  ) {
    return this.trackingService.calculateRoute(
      parseFloat(startLat),
      parseFloat(startLng),
      parseFloat(endLat),
      parseFloat(endLng),
    );
  }
}
