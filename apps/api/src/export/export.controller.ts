/* eslint-disable @typescript-eslint/no-base-to-string */
import {
  Controller,
  Get,
  Query,
  Res,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import type { Response } from 'express';
import { ExportService } from './export.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@food_delivery/types';

@ApiTags('Export')
@ApiBearerAuth()
@Controller('export')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExportController {
  constructor(private readonly exportService: ExportService) {}

  // ─── EXPORT ORDERS AS CSV ───
  @Get('orders/csv')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Export orders as CSV' })
  async exportOrdersCSV(
    @Res() res: Response,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('restaurantId') restaurantId?: string,
    @Query('status') status?: string,
  ) {
    const data = await this.exportService.getOrdersForExport({
      startDate,
      endDate,
      restaurantId,
      status,
    });

    if (!data.length) {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=orders-${Date.now()}.csv`,
      );
      res.send(
        'Order ID, Customer, Email, Phone, Restaurant, Date, Status, Items, Subtotal, Delivery Fee, Total, Payment Method, Payment Status, Notes\n',
      );
      return;
    }

    const headers = [
      'Order ID',
      'Customer',
      'Email',
      'Phone',
      'Restaurant',
      'Date',
      'Status',
      'Items',
      'Subtotal',
      'Delivery Fee',
      'Total',
      'Payment Method',
      'Payment Status',
      'Notes',
    ];

    const lines = [headers.join(',')];

    for (const row of data) {
      const items = row.items
        .map(
          (i: { name: string; quantity: number }) => `${i.name} x${i.quantity}`,
        )
        .join(' | ');

      const line = [
        row.orderId,
        row.customerName,
        row.customerEmail,
        row.customerPhone,
        row.restaurantName,
        new Date(row.orderDate).toLocaleString(),
        row.status,
        items,
        row.subtotal,
        row.deliveryFee,
        row.total,
        row.paymentMethod,
        row.paymentStatus,
        row.notes ?? '',
      ].map((field) => this.escapeCsv(field));

      lines.push(line.join(','));
    }

    const csv = lines.join('\n');

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="orders-${Date.now()}.csv"`,
    );
    res.send(`\uFEFF${csv}`);
  }

  // ─── GET SALES REPORT ───
  @Get('sales')
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Get sales report' })
  async getSalesReport(
    @Query('period') period: 'day' | 'week' | 'month',
    @Query('date') date?: string,
  ) {
    if (period && !['day', 'week', 'month'].includes(period)) {
      throw new BadRequestException('period must be one of: day, week, month');
    }
    return this.exportService.getSalesReport({ period, date });
  }

  private escapeCsv(value: unknown): string {
    const str =
      value === null || value === undefined
        ? ''
        : typeof value === 'object'
          ? JSON.stringify(value)
          : typeof value === 'string'
            ? value
            : String(value);
    if (/[",\n]/.test(str)) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }
}
