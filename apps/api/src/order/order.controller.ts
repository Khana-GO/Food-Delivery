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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { OrdersService } from './order.service';
import { IsUUID } from 'class-validator';

class AssignDriverDto {
  @IsUUID('4')
  driverId!: string;
}

@ApiTags('Orders')
@ApiBearerAuth()
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
  @Roles(UserRole.RESTAURANT_OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Assign a driver to an order' })
  async assignDriver(
    @CurrentUser() user: JwtPayload,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AssignDriverDto,
  ): Promise<OrderResponseDto> {
    return this.ordersService.assignDriver(
      id,
      dto.driverId,
      user.sub,
      user.role,
    );
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
