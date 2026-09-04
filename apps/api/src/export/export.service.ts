import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { ordersTable } from '../db/schema/order.schema';
import { orderItemsTable } from '../db/schema/order.items.schema';
import { usersTable } from '../db/schema/user.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import * as schema from '../db/schema';
import { eq, and, gte, lte, desc, type SQL } from 'drizzle-orm';
import { menuItemsTable } from '../db/schema/menu.items.schema';

@Injectable()
export class ExportService {
  private readonly logger = new Logger(ExportService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── GET ORDERS FOR EXPORT ───
  async getOrdersForExport(params: {
    startDate?: string;
    endDate?: string;
    restaurantId?: string;
    status?: string;
  }): Promise<any[]> {
    const { startDate, endDate, restaurantId, status } = params;

    const conditions: SQL[] = [];

    if (startDate) {
      conditions.push(gte(ordersTable.createdAt, new Date(startDate)));
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      conditions.push(lte(ordersTable.createdAt, end));
    }
    if (restaurantId) {
      conditions.push(eq(ordersTable.restaurantId, restaurantId));
    }
    if (status) {
      conditions.push(eq(ordersTable.orderStatus, status as never));
    }

    const orders = await this.db
      .select()
      .from(ordersTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ordersTable.createdAt));

    // Enrich with customer and restaurant data
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const customer = await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, order.customerId),
        });
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: eq(restaurantsTable.id, order.restaurantId),
        });
        const items = await this.db
          .select()
          .from(orderItemsTable)
          .where(eq(orderItemsTable.orderId, order.id));

        const itemsWithNames = await Promise.all(
          items.map(async (item) => {
            const menuItem = await this.db.query.menuItemsTable.findFirst({
              where: eq(menuItemsTable.id, item.menuItemId),
            });
            return {
              name: menuItem?.name || 'Unknown',
              quantity: item.quantity,
              price: item.unitPrice,
              total: item.totalPrice,
            };
          }),
        );

        return {
          orderId: order.id,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'Unknown',
          customerEmail: customer?.email || '',
          customerPhone: customer?.phone || '',
          restaurantName: restaurant?.name || 'Unknown',
          orderDate: order.createdAt,
          status: order.orderStatus,
          subtotal: order.subtotal,
          deliveryFee: order.deliveryFee,
          total: order.totalAmount,
          paymentMethod: order.paymentMethod,
          paymentStatus: order.paymentStatus,
          items: itemsWithNames,
          notes: order.notes,
        };
      }),
    );

    return enriched;
  }

  // ─── GET SALES REPORT ───
  async getSalesReport(params: {
    period: 'day' | 'week' | 'month';
    date?: string;
  }): Promise<any> {
    const { period, date } = params;

    let startDate: Date;
    const endDate = new Date();

    if (date) {
      const d = new Date(date);
      if (period === 'day') {
        startDate = new Date(d);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (period === 'week') {
        const day = d.getDay();
        startDate = new Date(d);
        startDate.setDate(d.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(d.getFullYear(), d.getMonth(), 1);
        endDate.setMonth(d.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    } else {
      const now = new Date();
      if (period === 'day') {
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);
      } else if (period === 'week') {
        const day = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - day);
        startDate.setHours(0, 0, 0, 0);
        endDate.setDate(startDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate.setMonth(now.getMonth() + 1, 0);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    const orders = await this.db
      .select()
      .from(ordersTable)
      .where(
        and(
          gte(ordersTable.createdAt, startDate),
          lte(ordersTable.createdAt, endDate),
        ),
      );

    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount),
      0,
    );
    const delivered = orders.filter(
      (o) => o.orderStatus === 'DELIVERED',
    ).length;
    const cancelled = orders.filter(
      (o) => o.orderStatus === 'CANCELLED',
    ).length;

    // Group by restaurant
    const restaurantStats: Record<string, any> = {};
    for (const order of orders) {
      if (!restaurantStats[order.restaurantId]) {
        restaurantStats[order.restaurantId] = {
          orders: 0,
          revenue: 0,
        };
      }
      restaurantStats[order.restaurantId].orders += 1;
      restaurantStats[order.restaurantId].revenue += parseFloat(
        order.totalAmount,
      );
    }

    return {
      period,
      startDate,
      endDate,
      totalOrders,
      totalRevenue,
      delivered,
      cancelled,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      restaurantBreakdown: restaurantStats,
      orders,
    };
  }
}
