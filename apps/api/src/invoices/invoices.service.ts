import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Inject } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { invoicesTable } from '../db/schema/invoice.schema';
import { ordersTable } from '../db/schema/order.schema';
import { usersTable } from '../db/schema/user.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { eq, and, desc, count, gte, lte, sql, inArray } from 'drizzle-orm';
import { InvoiceResponseDto } from './dto/invoice-response.dto';
import * as schema from '../db/schema';
import { CacheService } from '../redis/cache.service';
import { InvoicePaginationDto } from './dto/invoice-pagination.dto';

@Injectable()
export class InvoicesService {
  private readonly logger = new Logger(InvoicesService.name);
  private static readonly MAX_INVOICE_RETRIES = 3;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  /**
   * `INV-<yyyymmdd>-<6 random digits>`.
   *
   * Uses a CSPRNG (previously `Math.random()`, which is predictable and gave
   * only 9,000 values per day, so the 3 retries below could be exhausted).
   */
  private generateInvoiceNumber(): string {
    const now = new Date();
    const datePart = now.toISOString().split('T')[0].replace(/-/g, '');
    const random = randomInt(0, 1_000_000).toString().padStart(6, '0');
    return `INV-${datePart}-${random}`;
  }

  async createInvoiceFromOrder(orderId: string): Promise<InvoiceResponseDto> {
    const order = await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
    });
    if (!order) throw new NotFoundException('Order not found');

    const now = new Date();

    // Retry on unique constraint violation (invoice number collision)
    let invoice: any = null;
    for (
      let attempt = 0;
      attempt < InvoicesService.MAX_INVOICE_RETRIES;
      attempt++
    ) {
      const invoiceNumber = this.generateInvoiceNumber();
      try {
        invoice = await this.insertInvoice(order, invoiceNumber, now);
        break;
      } catch (err: any) {
        const isUniqueViolation =
          err?.code === '23505' || err?.message?.includes('unique');
        if (
          isUniqueViolation &&
          attempt < InvoicesService.MAX_INVOICE_RETRIES - 1
        ) {
          this.logger.warn(
            `Invoice number collision on attempt ${attempt + 1}, retrying...`,
          );
          continue;
        }
        throw err;
      }
    }

    this.logger.log(
      `Invoice created: ${invoice.invoiceNumber} for order ${orderId}`,
    );

    await this.invalidateInvoiceCaches();

    return this.enrichInvoice(invoice);
  }

  private async insertInvoice(
    order: typeof ordersTable.$inferSelect,
    invoiceNumber: string,
    now: Date,
  ) {
    // Derive all amounts from the order snapshot — no need to re-query items.
    // The customer's prices are VAT-inclusive, so order.totalAmount is the
    // authoritative billable figure (items + delivery - discount). The tax
    // component is *derived* from it, never added on top of it.
    const subtotal = parseFloat(order.subtotal);
    const deliveryFee = parseFloat(order.deliveryFee);
    const discount = parseFloat(String(order.discount ?? '0')) || 0;
    const taxableBase = Math.max(subtotal - discount, 0);
    const tax = +(taxableBase - taxableBase / 1.13).toFixed(2);
    const total = parseFloat(order.totalAmount);

    const [created] = await this.db
      .insert(invoicesTable)
      .values({
        orderId: order.id,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        invoiceNumber,
        subtotal: subtotal.toFixed(2),
        tax: tax.toFixed(2),
        deliveryFee: deliveryFee.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        issuedAt: now,
        paidAt: order.paymentStatus === 'PAID' ? now : null,
        createdAt: now,
        updatedAt: now,
      })
      .returning();
    return created;
  }

  private async enrichInvoice(invoice: any): Promise<InvoiceResponseDto> {
    const [order, restaurant, customer] = await Promise.all([
      this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, invoice.orderId),
      }),
      this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, invoice.restaurantId),
      }),
      this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, invoice.customerId),
      }),
    ]);

    return {
      id: invoice.id,
      orderId: invoice.orderId,
      customerId: invoice.customerId,
      restaurantId: invoice.restaurantId,
      invoiceNumber: invoice.invoiceNumber,
      subtotal: parseFloat(invoice.subtotal),
      tax: parseFloat(invoice.tax),
      deliveryFee: parseFloat(invoice.deliveryFee),
      discount: parseFloat(invoice.discount),
      total: parseFloat(invoice.total),
      paymentMethod: invoice.paymentMethod,
      paymentStatus: invoice.paymentStatus,
      issuedAt: invoice.issuedAt,
      paidAt: invoice.paidAt,
      createdAt: invoice.createdAt,
      orderStatus: order?.orderStatus,
      restaurantName: restaurant?.name,
      customerName: customer
        ? `${customer.firstName} ${customer.lastName}`
        : undefined,
    };
  }

  private async batchEnrichInvoices(
    invoices: any[],
  ): Promise<InvoiceResponseDto[]> {
    if (!invoices.length) return [];

    const orderIds = [...new Set(invoices.map((i) => i.orderId))];
    const restaurantIds = [...new Set(invoices.map((i) => i.restaurantId))];
    const customerIds = [...new Set(invoices.map((i) => i.customerId))];

    const [orders, restaurants, customers] = await Promise.all([
      orderIds.length
        ? this.db
            .select()
            .from(ordersTable)
            .where(inArray(ordersTable.id, orderIds))
        : Promise.resolve([] as any[]),
      restaurantIds.length
        ? this.db
            .select()
            .from(restaurantsTable)
            .where(inArray(restaurantsTable.id, restaurantIds))
        : Promise.resolve([] as any[]),
      customerIds.length
        ? this.db
            .select()
            .from(usersTable)
            .where(inArray(usersTable.id, customerIds))
        : Promise.resolve([] as any[]),
    ]);

    const orderMap = new Map(orders.map((o) => [o.id, o]));
    const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));
    const customerMap = new Map(customers.map((c) => [c.id, c]));

    return invoices.map((invoice) => {
      const order = orderMap.get(invoice.orderId);
      const restaurant = restaurantMap.get(invoice.restaurantId);
      const customer = customerMap.get(invoice.customerId);

      return {
        id: invoice.id,
        orderId: invoice.orderId,
        customerId: invoice.customerId,
        restaurantId: invoice.restaurantId,
        invoiceNumber: invoice.invoiceNumber,
        subtotal: parseFloat(invoice.subtotal),
        tax: parseFloat(invoice.tax),
        deliveryFee: parseFloat(invoice.deliveryFee),
        discount: parseFloat(invoice.discount),
        total: parseFloat(invoice.total),
        paymentMethod: invoice.paymentMethod,
        paymentStatus: invoice.paymentStatus,
        issuedAt: invoice.issuedAt,
        paidAt: invoice.paidAt,
        createdAt: invoice.createdAt,
        orderStatus: order?.orderStatus,
        restaurantName: restaurant?.name,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : undefined,
      };
    });
  }

  async getInvoiceById(id: string): Promise<InvoiceResponseDto> {
    const invoice = await this.db.query.invoicesTable.findFirst({
      where: eq(invoicesTable.id, id),
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return this.enrichInvoice(invoice);
  }

  async getInvoiceByIdForUser(
    id: string,
    userId: string,
    role: string,
  ): Promise<InvoiceResponseDto> {
    const invoice = await this.db.query.invoicesTable.findFirst({
      where: eq(invoicesTable.id, id),
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    // Admin can access any invoice
    if (role === 'ADMIN') {
      return this.enrichInvoice(invoice);
    }

    // Customer can only access their own invoices
    if (role === 'CUSTOMER' && invoice.customerId !== userId) {
      throw new NotFoundException('Invoice not found');
    }

    // Restaurant owner can only access invoices for their restaurants
    if (role === 'RESTAURANT_OWNER') {
      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, invoice.restaurantId),
      });
      if (!restaurant || restaurant.ownerId !== userId) {
        throw new NotFoundException('Invoice not found');
      }
    }

    return this.enrichInvoice(invoice);
  }

  async getUserInvoices(userId: string, pagination: InvoicePaginationDto) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      paymentStatus,
    } = pagination;
    const conditions = [eq(invoicesTable.customerId, userId)];

    if (startDate) {
      conditions.push(gte(invoicesTable.issuedAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(invoicesTable.issuedAt, new Date(endDate)));
    }
    if (paymentStatus) {
      conditions.push(eq(invoicesTable.paymentStatus, paymentStatus));
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(invoicesTable)
      .where(whereClause);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invoices = await this.db
      .select()
      .from(invoicesTable)
      .where(whereClause)
      .orderBy(desc(invoicesTable.issuedAt))
      .limit(limit)
      .offset(offset);

    const enriched = await this.batchEnrichInvoices(invoices);

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getRestaurantInvoices(
    restaurantId: string,
    pagination: InvoicePaginationDto,
  ) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      paymentStatus,
    } = pagination;
    const conditions = [eq(invoicesTable.restaurantId, restaurantId)];

    if (startDate) {
      conditions.push(gte(invoicesTable.issuedAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(invoicesTable.issuedAt, new Date(endDate)));
    }
    if (paymentStatus) {
      conditions.push(eq(invoicesTable.paymentStatus, paymentStatus));
    }

    const whereClause = and(...conditions);

    const [countResult] = await this.db
      .select({ total: count() })
      .from(invoicesTable)
      .where(whereClause);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invoices = await this.db
      .select()
      .from(invoicesTable)
      .where(whereClause)
      .orderBy(desc(invoicesTable.issuedAt))
      .limit(limit)
      .offset(offset);

    const enriched = await this.batchEnrichInvoices(invoices);

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getAllInvoices(pagination: InvoicePaginationDto) {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      paymentStatus,
    } = pagination;
    const conditions: any[] = [];

    if (startDate) {
      conditions.push(gte(invoicesTable.issuedAt, new Date(startDate)));
    }
    if (endDate) {
      conditions.push(lte(invoicesTable.issuedAt, new Date(endDate)));
    }
    if (paymentStatus) {
      conditions.push(eq(invoicesTable.paymentStatus, paymentStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [countResult] = await this.db
      .select({ total: count() })
      .from(invoicesTable)
      .where(whereClause);

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const invoices = await this.db
      .select()
      .from(invoicesTable)
      .where(whereClause)
      .orderBy(desc(invoicesTable.issuedAt))
      .limit(limit)
      .offset(offset);

    const enriched = await this.batchEnrichInvoices(invoices);

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async getBillingStats() {
    const cached = await this.cache.get('invoice-stats');
    if (cached) return cached;

    const stats = await this.db
      .select({
        totalRevenue: sql<number>`SUM(CAST(${invoicesTable.total} AS numeric))`,
        totalTax: sql<number>`SUM(CAST(${invoicesTable.tax} AS numeric))`,
        totalOrders: sql<number>`COUNT(*)`,
        paidOrders: sql<number>`COUNT(*) FILTER (WHERE ${invoicesTable.paymentStatus} = 'PAID')`,
        pendingOrders: sql<number>`COUNT(*) FILTER (WHERE ${invoicesTable.paymentStatus} = 'PENDING')`,
      })
      .from(invoicesTable);

    const result = {
      totalRevenue: Number(stats[0]?.totalRevenue) || 0,
      totalTax: Number(stats[0]?.totalTax) || 0,
      totalOrders: Number(stats[0]?.totalOrders) || 0,
      paidOrders: Number(stats[0]?.paidOrders) || 0,
      pendingOrders: Number(stats[0]?.pendingOrders) || 0,
    };

    await this.cache.set('invoice-stats', result, 300);
    return result;
  }

  async updatePaymentStatus(orderId: string, status: string) {
    const invoice = await this.db.query.invoicesTable.findFirst({
      where: eq(invoicesTable.orderId, orderId),
    });
    if (!invoice) {
      this.logger.warn(
        `No invoice found for order ${orderId}, skipping invoice payment sync`,
      );
      return;
    }

    const target =
      status === 'PAID' ? 'PAID' : status === 'FAILED' ? 'FAILED' : status;

    await this.db
      .update(invoicesTable)
      .set({
        paymentStatus: target,
        paidAt: target === 'PAID' ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(invoicesTable.orderId, orderId));

    this.logger.log(
      `Invoice payment status for order ${orderId} updated to ${target}`,
    );

    await this.invalidateInvoiceCaches();
  }

  private async invalidateInvoiceCaches(): Promise<void> {
    await Promise.all([
      this.cache.delByPattern('invoice:*'),
      this.cache.del('invoice-stats'),
    ]);
  }
}
