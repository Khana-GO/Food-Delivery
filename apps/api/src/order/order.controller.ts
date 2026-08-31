import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderResponseDto } from './dto/order-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { ValidateCartDto } from './dto/validate-cart.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrdersService } from './order.service';
import { IsUUID, IsOptional } from 'class-validator';

export class AssignDriverDto {
  @IsUUID('4')
  @IsOptional()
  driverId?: string;
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // ─── GET AVAILABLE ORDERS (for drivers) ───
  @Get('available')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get available orders for driver pickup' })
  async getAvailableOrders(
    @Query('latitude') latitude?: string,
    @Query('longitude') longitude?: string,
    @Query('radius') radius?: string,
  ) {
    const lat = latitude ? parseFloat(latitude) : undefined;
    const lng = longitude ? parseFloat(longitude) : undefined;
    const r = radius ? parseFloat(radius) : 10;
    // Validate numbers, ignore NaN
    return this.ordersService.getAvailableOrders(
      lat != null && !isNaN(lat) ? lat : undefined,
      lng != null && !isNaN(lng) ? lng : undefined,
      r != null && !isNaN(r) ? Math.min(Math.max(r, 1), 50) : 10,
    );
  }

  // ─── GET DRIVER ACTIVE ORDER ───
  @Get('driver/active')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get driver active order' })
  async getDriverActiveOrder(@CurrentUser() user: JwtPayload) {
    return this.ordersService.getDriverActiveOrder(user.sub);
  }

  // ─── GET DRIVER ORDER HISTORY ───
  @Get('driver/history')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get driver order history' })
  async getDriverOrderHistory(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    return this.ordersService.getDriverOrderHistory(
      user.sub,
      limit ? parseInt(limit) : 50,
    );
  }

  // ─── GET DRIVER EARNINGS ───
  @Get('driver/earnings')
  @Roles(UserRole.DRIVER)
  @ApiOperation({ summary: 'Get driver earnings' })
  async getDriverEarnings(@CurrentUser() user: JwtPayload) {
    return this.ordersService.getDriverEarnings(user.sub);
  }

  // ─── CREATE ───
  @Post()
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Create a new order (checkout)' })
  @ApiResponse({ status: 201, type: OrderResponseDto })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.create(user.sub, dto);
  }

  // ─── GET ORDERS (must be before :id) ───
  @Get()
  @ApiOperation({ summary: 'Get orders based on user role' })
  async getOrders(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: OrderPaginationDto,
  ) {
    return this.ordersService.getOrders(user.sub, user.role!, pagination);
  }

  // ─── STATS – before :id to avoid shadowing ───
  @Get('stats/overview')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics (Admin only)' })
  async getOrderStats() {
    return this.ordersService.getOrderStats();
  }

  @Get('stats')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get order statistics (Admin only) – alias' })
  async getOrderStatsAlias() {
    return this.ordersService.getOrderStats();
  }

  // ─── VALIDATE CART (must be before :id) ───
  @Post('validate-cart')
  @ApiOperation({
    summary: 'Validate cart items (check availability and prices)',
  })
  async validateCart(@Body() dto: ValidateCartDto) {
    return this.ordersService.validateCart(dto.items);
  }

  // ─── GET BY ID ───
  @Get(':id')
  @ApiOperation({ summary: 'Get order by ID' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async getOrderById(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<OrderResponseDto> {
    const order = await this.ordersService.getOrderById(id);
    if (user.role === UserRole.CUSTOMER && order.customerId !== user.sub) {
      throw new ForbiddenException(
        'You do not have permission to view this order',
      );
    }
    if (user.role === UserRole.RESTAURANT_OWNER) {
      const owned = await this.ordersService.getRestaurantsByOwnerId(user.sub);
      const ownedIds = new Set(owned.map((r) => r.id));
      if (!ownedIds.has(order.restaurantId)) {
        throw new ForbiddenException(
          'You do not have permission to view this order',
        );
      }
    }
    if (user.role === UserRole.DRIVER && order.driverId !== user.sub) {
      throw new ForbiddenException('You are not assigned to this order');
    }
    // ADMIN bypass
    return order;
  }

  // ─── UPDATE STATUS ───
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update order status' })
  @ApiResponse({ status: 200, type: OrderResponseDto })
  async updateOrderStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.updateOrderStatus(id, user.sub, user.role!, dto);
  }

  // ─── ASSIGN DRIVER ───
  @Patch(':id/assign-driver')
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN, UserRole.DRIVER)
  @ApiOperation({ summary: 'Assign a driver to an order' })
  async assignDriver(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignDriverDto,
  ): Promise<OrderResponseDto> {
    // Driver self-assign fallback: if no driverId provided and requester is DRIVER, use own id
    const driverId =
      dto.driverId || (user.role === UserRole.DRIVER ? user.sub : undefined);
    if (!driverId) throw new ForbiddenException('driverId required');
    return this.ordersService.assignDriver(id, driverId, user.sub, user.role);
  }

  // ─── CANCEL ───
  @Delete(':id/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel an order' })
  async cancelOrder(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ): Promise<{ message: string }> {
    return this.ordersService.cancelOrder(id, user.sub, user.role!);
  }
}
