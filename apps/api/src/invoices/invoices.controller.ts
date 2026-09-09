import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { InvoicePaginationDto } from './dto/invoice-pagination.dto';

@ApiTags('Invoices')
@ApiBearerAuth()
@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Get('user')
  @Roles(UserRole.CUSTOMER)
  @ApiOperation({ summary: 'Get invoices for the logged-in customer' })
  async getUserInvoices(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: InvoicePaginationDto,
  ) {
    return this.invoicesService.getUserInvoices(user.sub, pagination);
  }

  @Get('restaurant/:restaurantId')
  @Roles(UserRole.RESTAURANT_OWNER)
  @ApiOperation({ summary: 'Get invoices for a restaurant (owner only)' })
  async getRestaurantInvoices(
    @CurrentUser() user: JwtPayload,
    @Param('restaurantId') restaurantId: string,
    @Query() pagination: InvoicePaginationDto,
  ) {
    return this.invoicesService.getRestaurantInvoices(restaurantId, pagination);
  }

  @Get('stats/admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get billing statistics (admin only)' })
  async getBillingStats() {
    return this.invoicesService.getBillingStats();
  }

  @Get('admin')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get all invoices (admin only)' })
  async getAllInvoices(@Query() pagination: InvoicePaginationDto) {
    return this.invoicesService.getAllInvoices(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice by ID (authorized by role)' })
  async getInvoice(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.invoicesService.getInvoiceByIdForUser(id, user.sub, user.role!);
  }
}
