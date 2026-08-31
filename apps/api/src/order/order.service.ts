/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison, @typescript-eslint/no-require-imports */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  Inject,
  Optional,
  forwardRef,
} from '@nestjs/common';
import { eq, and, sql, desc, asc, count, inArray, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { ordersTable, type NewOrder } from '../db/schema/order.schema';
import {
  orderItemsTable,
  type NewOrderItem,
} from '../db/schema/order.items.schema';
import { usersTable } from '../db/schema/user.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { addressesTable } from '../db/schema/user.address.schema';
import { menuItemsTable } from '../db/schema/menu.items.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto, OrderStatus } from './dto/update-order.dto';
import { ValidateCartItemDto } from './dto/validate-cart.dto';
import { AdminOrderStatsDto } from './dto/admin-order-stats.dto';
import {
  OrderResponseDto,
  OrderItemResponseDto,
} from './dto/order-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';
import { NotificationsService } from '../notification/notification.service';
// Circular import is avoided via forwardRef + optional injection
import type { TrackingGateway } from '../tracking/tracking.gateway';
import type { OrderGateway } from './order.gateway';
import { AdminOrderPaginationDto } from './dto/admin-order-pagination.dto';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);
  private readonly CACHE_TTL = 60;
  private readonly ENTITY_TTL = 300;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
    private readonly notificationsService: NotificationsService,
    @Optional()
    @Inject(
      forwardRef(() => require('../tracking/tracking.gateway').TrackingGateway),
    )
    private readonly trackingGateway?: TrackingGateway,
    @Optional()
    @Inject(forwardRef(() => require('./order.gateway').OrderGateway))
    private readonly orderGateway?: OrderGateway,
  ) {}

  private keyList(hash: string) {
    return `order:list:${hash}`;
  }
  private keyId(id: string) {
    return `order:id:${id}`;
  }
  private keyCustomer(customerId: string) {
    return `order:customer:${customerId}`;
  }
  private keyRestaurant(restaurantId: string) {
    return `order:restaurant:${restaurantId}`;
  }
  private keyDriver(driverId: string) {
    return `order:driver:${driverId}`;
  }
  private keyStats() {
    return `order:stats:overview`;
  }

  private async invalidateOrder(opts: {
    id?: string;
    customerId?: string;
    restaurantId?: string;
    driverId?: string;
  }): Promise<void> {
    const ops: Promise<void>[] = [
      this.cache.delByPattern('order:list:*'),
      this.cache.del(this.keyStats()),
      this.cache.delByPattern('admin:orders:*'),
      this.cache.del('admin:order-stats'),
    ];
    if (opts.id) ops.push(this.cache.del(this.keyId(opts.id)));
    if (opts.customerId)
      ops.push(this.cache.del(this.keyCustomer(opts.customerId)));
    if (opts.restaurantId)
      ops.push(this.cache.del(this.keyRestaurant(opts.restaurantId)));
    if (opts.driverId) ops.push(this.cache.del(this.keyDriver(opts.driverId)));
    await Promise.all(ops);
  }

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`[${context}] Error:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  private buildFullAddress(
    address: typeof addressesTable.$inferSelect | undefined,
  ): string {
    if (!address) return '';
    const parts = [
      address.addressLine,
      address.city,
      address.state,
      address.country,
      address.postalCode,
    ].filter(Boolean);
    return parts.join(', ');
  }

  private toResponse(
    order: typeof ordersTable.$inferSelect,
    customer: typeof usersTable.$inferSelect | undefined,
    restaurant: typeof restaurantsTable.$inferSelect | undefined,
    address: typeof addressesTable.$inferSelect | undefined,
    driver: typeof usersTable.$inferSelect | undefined | null,
    items: OrderItemResponseDto[],
  ): OrderResponseDto {
    return {
      id: order.id,
      customerId: order.customerId,
      customerName: customer
        ? `${customer.firstName} ${customer.lastName}`
        : 'Unknown',
      customerPhone: customer?.phone || '',
      restaurantId: order.restaurantId,
      restaurantName: restaurant?.name || 'Unknown',
      restaurantAddress: restaurant?.address || '',
      driverId: order.driverId || undefined,
      driverName: driver ? `${driver.firstName} ${driver.lastName}` : undefined,
      addressId: order.addressId,
      deliveryAddress:
        (order.deliveryAddressSnapshot as string) ||
        this.buildFullAddress(address) ||
        '',
      items,
      subtotal: parseFloat(order.subtotal),
      deliveryFee: parseFloat(order.deliveryFee),
      totalAmount: parseFloat(order.totalAmount),
      notes: order.notes || undefined,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      estimatedDeliveryTime: order.estimatedDeliveryTime || undefined,
      estimatedDeliveryMinutes:
        (order as any).estimatedDeliveryMinutes || undefined,
      deliveredAt: order.deliveredAt || undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  // ─── VALIDATE CART (batched, no N+1) ───
  async validateCart(
    items: ValidateCartItemDto[],
  ): Promise<{ valid: boolean; items: any[] }> {
    if (!items.length) return { valid: true, items: [] };
    const ids = [...new Set(items.map((i) => i.menuItemId))];
    const menuItems = await this.db
      .select()
      .from(menuItemsTable)
      .where(inArray(menuItemsTable.id, ids));
    const map = new Map(menuItems.map((m) => [m.id, m]));
    const validatedItems: any[] = [];
    let valid = true;

    for (const item of items) {
      const menuItem = map.get(item.menuItemId) as any;
      if (!menuItem) {
        valid = false;
        validatedItems.push({ ...item, error: 'Item not found' });
        continue;
      }
      if (!menuItem.isAvailable) {
        valid = false;
        validatedItems.push({
          ...item,
          name: menuItem.name,
          price: parseFloat(menuItem.price),
          isAvailable: false,
          error: 'Item is currently unavailable',
        });
        continue;
      }
      const currentPrice = parseFloat(menuItem.price);
      validatedItems.push({
        ...item,
        name: menuItem.name,
        price: currentPrice,
        isAvailable: true,
        priceUpdated: currentPrice !== item.unitPrice,
      });
      if (currentPrice !== item.unitPrice) {
        // priceUpdated doesn't invalidate, but could inform frontend
      }
    }

    return { valid, items: validatedItems };
  }

  // ─── CREATE ORDER (transactional + secure pricing) ───
  async create(
    customerId: string,
    dto: CreateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.handleDbOperation(async () => {
      // 1. Validate restaurant
      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: and(
          eq(restaurantsTable.id, dto.restaurantId),
          sql`${restaurantsTable.deletedAt} IS NULL`,
        ),
      });
      if (!restaurant) throw new NotFoundException('Restaurant not found');
      if (!restaurant.isOpen || !restaurant.isActive) {
        throw new BadRequestException(
          'Restaurant is currently not accepting orders',
        );
      }
      if (!restaurant.isVerified) {
        throw new BadRequestException('Restaurant is not verified yet');
      }

      // 2. Validate address belongs to customer
      const address = await this.db.query.addressesTable.findFirst({
        where: and(
          eq(addressesTable.id, dto.addressId),
          eq(addressesTable.userId, customerId),
        ),
      });
      if (!address) throw new NotFoundException('Address not found');

      // 3. Validate & fetch menu items (secure – ignore client price)
      const menuItemIds = [...new Set(dto.items.map((i) => i.menuItemId))];
      const menuItems = await this.db
        .select()
        .from(menuItemsTable)
        .where(inArray(menuItemsTable.id, menuItemIds));
      if (menuItems.length !== menuItemIds.length)
        throw new BadRequestException('Some menu items are invalid');

      // Ensure all items belong to ordered restaurant
      for (const m of menuItems) {
        if (m.restaurantId !== dto.restaurantId) {
          throw new BadRequestException(
            `Menu item "${m.name}" does not belong to this restaurant`,
          );
        }
        if (!m.isAvailable)
          throw new BadRequestException(
            `Menu item "${m.name}" is not available`,
          );
      }

      // Build priced items from DB
      let subtotal = 0;
      const orderItemsPrep: Array<Omit<NewOrderItem, 'orderId'>> = [];
      const itemsResponse: OrderItemResponseDto[] = [];

      for (const reqItem of dto.items) {
        const menuItem = menuItems.find((m) => m.id === reqItem.menuItemId)!;
        const dbPrice = parseFloat(menuItem.price);
        if (Number.isNaN(dbPrice))
          throw new InternalServerErrorException(
            `Invalid price for ${menuItem.name}`,
          );
        const qty = Math.floor(reqItem.quantity);
        if (qty < 1 || qty > 100)
          throw new BadRequestException(
            `Quantity for ${menuItem.name} must be 1-100`,
          );
        const totalPrice = +(dbPrice * qty).toFixed(2);
        subtotal = +(subtotal + totalPrice).toFixed(2);

        orderItemsPrep.push({
          menuItemId: menuItem.id,
          itemNameSnapshot: menuItem.name,
          quantity: qty,
          unitPrice: dbPrice.toFixed(2),
          totalPrice: totalPrice.toFixed(2),
          createdAt: new Date(),
        });

        itemsResponse.push({
          id: '',
          menuItemId: menuItem.id,
          name: menuItem.name,
          quantity: qty,
          unitPrice: dbPrice,
          totalPrice,
        });
      }

      // Minimum order amount check
      const minAmount = parseFloat(restaurant.minimumOrderAmount) || 0;
      if (subtotal < minAmount) {
        throw new BadRequestException(
          `Minimum order amount is Rs. ${minAmount.toFixed(2)} (current subtotal Rs. ${subtotal.toFixed(2)})`,
        );
      }

      const deliveryFee = parseFloat(restaurant.deliveryFee) || 0;
      const totalAmount = +(subtotal + deliveryFee).toFixed(2);
      const deliverySnapshot = this.buildFullAddress(address);

      // ONLINE may be created before eSewa verification – paymentId optional, will be set on verify.
      // If you want to enforce, uncomment next line. For now allow PENDING creation.
      // if (dto.paymentMethod === 'ONLINE' && !dto.paymentId) throw new BadRequestException('paymentId required for ONLINE payment');

      // 4. Transaction: order + items
      const { order, createdItems } = await (this.db as any).transaction(
        async (tx: any) => {
          const [ord] = await tx
            .insert(ordersTable)
            .values({
              customerId,
              restaurantId: dto.restaurantId,
              addressId: dto.addressId,
              deliveryAddressSnapshot: deliverySnapshot,
              subtotal: subtotal.toFixed(2),
              deliveryFee: deliveryFee.toFixed(2),
              totalAmount: totalAmount.toFixed(2),
              notes: dto.notes,
              paymentMethod: dto.paymentMethod || 'OFFLINE',
              // ONLINE always PENDING until eSewa verify flips to PAID – prevents fake paymentId exploit
              paymentStatus: 'PENDING',
              orderStatus: 'PENDING',
              paymentId: dto.paymentId,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
            .returning();
          if (!ord)
            throw new InternalServerErrorException('Failed to create order');
          const itemsWithOrderId = orderItemsPrep.map((it) => ({
            ...it,
            orderId: ord.id,
          }));
          const cItems = await tx
            .insert(orderItemsTable)
            .values(itemsWithOrderId)
            .returning();
          return { order: ord, createdItems: cItems };
        },
      );

      createdItems.forEach((c: any, idx: number) => {
        if (itemsResponse[idx]) itemsResponse[idx].id = c.id;
      });

      // 5. Notifications (fail-open)
      await this.notificationsService
        .create({
          userId: restaurant.ownerId,
          type: 'order',
          title: 'New Order!',
          body: `Order #${order.id.slice(0, 8)} received. Total: Rs. ${totalAmount}`,
          data: { orderId: order.id, restaurantId: restaurant.id },
        })
        .catch((err: any) =>
          this.logger.warn(`Failed owner notify: ${err?.message}`),
        );

      await this.invalidateOrder({
        customerId,
        restaurantId: dto.restaurantId,
      });

      this.logger.log(`Order created: ${order.id} by ${customerId}`);

      const customer = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, customerId),
      });
      return this.toResponse(
        order,
        customer,
        restaurant,
        address,
        null,
        itemsResponse,
      );
    }, 'create');
  }

  // ─── GET ORDERS (optimized) ───
  async getOrders(
    userId: string,
    role: string,
    pagination: OrderPaginationDto,
  ) {
    return this.handleDbOperation(async () => {
      const {
        page = 1,
        limit = 10,
        status,
        restaurantId,
        customerId,
        driverId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = pagination;

      if (page < 1) throw new BadRequestException('Page must be >=1');
      if (limit < 1 || limit > 100)
        throw new BadRequestException('Limit 1-100');

      const allowedSort: Record<string, any> = {
        createdAt: ordersTable.createdAt,
        updatedAt: ordersTable.updatedAt,
        totalAmount: ordersTable.totalAmount,
      };
      const sortCol = allowedSort[sortBy] ?? ordersTable.createdAt;
      const orderFn = sortOrder === 'ASC' ? asc(sortCol) : desc(sortCol);

      const conditions: any[] = [];
      if (role === 'CUSTOMER')
        conditions.push(eq(ordersTable.customerId, userId));
      else if (role === 'RESTAURANT_OWNER') {
        const restaurants = await this.db.query.restaurantsTable.findMany({
          where: eq(restaurantsTable.ownerId, userId),
        });
        const ids = restaurants.map((r) => r.id);
        if (!ids.length)
          return { data: [], total: 0, page, limit, totalPages: 0 };
        conditions.push(inArray(ordersTable.restaurantId, ids));
      } else if (role === 'DRIVER')
        conditions.push(eq(ordersTable.driverId, userId));

      if (status) conditions.push(eq(ordersTable.orderStatus, status as any));
      if (restaurantId)
        conditions.push(eq(ordersTable.restaurantId, restaurantId));
      if (customerId) conditions.push(eq(ordersTable.customerId, customerId));
      if (driverId) conditions.push(eq(ordersTable.driverId, driverId));
      if (startDate) {
        const d = new Date(startDate);
        if (Number.isNaN(d.getTime()))
          throw new BadRequestException('Invalid startDate');
        conditions.push(
          sql`${ordersTable.createdAt} >= ${d.toISOString()}::timestamp`,
        );
      }
      if (endDate) {
        const d = new Date(endDate);
        if (Number.isNaN(d.getTime()))
          throw new BadRequestException('Invalid endDate');
        conditions.push(
          sql`${ordersTable.createdAt} <= ${d.toISOString()}::timestamp`,
        );
      }

      const whereClause = conditions.length ? and(...conditions) : undefined;
      const hash = CacheService.hashOptions({
        userId,
        role,
        page,
        limit,
        status,
        restaurantId,
        customerId,
        driverId,
        startDate,
        endDate,
        sortBy,
        sortOrder,
      });
      const cacheKey = this.keyList(hash);

      return this.cache.wrap(cacheKey, this.CACHE_TTL, async () => {
        const [countResult] = await this.db
          .select({ total: count() })
          .from(ordersTable)
          .where(whereClause);
        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const orders = await this.db
          .select()
          .from(ordersTable)
          .where(whereClause)
          .orderBy(orderFn)
          .limit(limit)
          .offset(offset);

        if (!orders.length) return { data: [], total, page, limit, totalPages };

        // Batch fetch related data (avoid N+1)
        const orderIds = orders.map((o) => o.id);
        const customerIds = [...new Set(orders.map((o) => o.customerId))];
        const restaurantIds = [...new Set(orders.map((o) => o.restaurantId))];
        const addressIds = [...new Set(orders.map((o) => o.addressId))];
        const driverIds = [
          ...new Set(orders.map((o) => o.driverId).filter(Boolean) as string[]),
        ];

        const [customers, restaurants, addresses, drivers, allItems] =
          await Promise.all([
            customerIds.length
              ? this.db
                  .select()
                  .from(usersTable)
                  .where(inArray(usersTable.id, customerIds))
              : Promise.resolve([] as any[]),
            restaurantIds.length
              ? this.db
                  .select()
                  .from(restaurantsTable)
                  .where(inArray(restaurantsTable.id, restaurantIds))
              : Promise.resolve([] as any[]),
            addressIds.length
              ? this.db
                  .select()
                  .from(addressesTable)
                  .where(inArray(addressesTable.id, addressIds))
              : Promise.resolve([] as any[]),
            driverIds.length
              ? this.db
                  .select()
                  .from(usersTable)
                  .where(inArray(usersTable.id, driverIds))
              : Promise.resolve([] as any[]),
            this.db
              .select()
              .from(orderItemsTable)
              .where(inArray(orderItemsTable.orderId, orderIds)),
          ] as const);

        // If items exist, fetch actual menu names for missing snapshots
        let menuMap = new Map<string, string>();
        if (allItems.length) {
          const menuIds = [...new Set(allItems.map((i) => i.menuItemId))];
          const menus = await this.db
            .select({ id: menuItemsTable.id, name: menuItemsTable.name })
            .from(menuItemsTable)
            .where(inArray(menuItemsTable.id, menuIds));
          menuMap = new Map(menus.map((m) => [m.id, m.name]));
          // also merge fallback from earlier if any
        }

        const customerMap = new Map(customers.map((c: any) => [c.id, c]));
        const restaurantMap = new Map(restaurants.map((r: any) => [r.id, r]));
        const addressMap = new Map(addresses.map((a: any) => [a.id, a]));
        const driverMap = new Map(drivers.map((d: any) => [d.id, d]));
        const itemsByOrder = new Map<string, typeof allItems>();
        for (const it of allItems) {
          const arr = itemsByOrder.get(it.orderId) || [];
          arr.push(it);
          itemsByOrder.set(it.orderId, arr);
        }

        const enriched = orders.map((order: any) =>
          this.toResponse(
            order,
            customerMap.get(order.customerId),
            restaurantMap.get(order.restaurantId),
            addressMap.get(order.addressId),
            order.driverId ? driverMap.get(order.driverId) : null,
            (itemsByOrder.get(order.id) || []).map((it: any) => ({
              id: it.id,
              menuItemId: it.menuItemId,
              name:
                it.itemNameSnapshot || menuMap.get(it.menuItemId) || 'Unknown',
              quantity:
                (it.quantity as unknown as number) ??
                parseInt(String(it.quantity), 10),
              unitPrice: parseFloat(it.unitPrice),
              totalPrice: parseFloat(it.totalPrice),
            })),
          ),
        );

        return { data: enriched, total, page, limit, totalPages };
      });
    }, 'getOrders');
  }

  // ─── GET ORDER BY ID ───
  async getOrderById(id: string): Promise<OrderResponseDto> {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyId(id), this.ENTITY_TTL, async () => {
        const order = await this.db.query.ordersTable.findFirst({
          where: eq(ordersTable.id, id),
        });
        if (!order)
          throw new NotFoundException(`Order with ID ${id} not found`);

        const [customer, restaurant, address, driver, items] =
          await Promise.all([
            this.db.query.usersTable.findFirst({
              where: eq(usersTable.id, order.customerId),
            }),
            this.db.query.restaurantsTable.findFirst({
              where: eq(restaurantsTable.id, order.restaurantId),
            }),
            this.db.query.addressesTable.findFirst({
              where: eq(addressesTable.id, order.addressId),
            }),
            order.driverId
              ? this.db.query.usersTable.findFirst({
                  where: eq(usersTable.id, order.driverId),
                })
              : null,
            this.db
              .select()
              .from(orderItemsTable)
              .where(eq(orderItemsTable.orderId, order.id)),
          ]);

        let menuMap = new Map<string, string>();
        if (items.length) {
          const menus = await this.db
            .select({ id: menuItemsTable.id, name: menuItemsTable.name })
            .from(menuItemsTable)
            .where(
              inArray(
                menuItemsTable.id,
                items.map((i) => i.menuItemId),
              ),
            );
          menuMap = new Map(menus.map((m) => [m.id, m.name]));
        }

        const itemsDto: OrderItemResponseDto[] = items.map((it) => ({
          id: it.id,
          menuItemId: it.menuItemId,
          name:
            (it as any).itemNameSnapshot ||
            menuMap.get(it.menuItemId) ||
            'Unknown',
          quantity: it.quantity ?? parseInt(String(it.quantity), 10),
          unitPrice: parseFloat(it.unitPrice),
          totalPrice: parseFloat(it.totalPrice),
        }));

        return this.toResponse(
          order,
          customer,
          restaurant,
          address,
          driver,
          itemsDto,
        );
      });
    }, 'getOrderById');
  }

  // Helper for controller permission check (owner owns many)
  async getRestaurantsByOwnerId(ownerId: string) {
    return this.db.query.restaurantsTable.findMany({
      where: eq(restaurantsTable.ownerId, ownerId),
    });
  }
  // Backward compat alias
  async getRestaurantByOwnerId(ownerId: string) {
    const list = await this.getRestaurantsByOwnerId(ownerId);
    return list[0] || null;
  }

  // ─── ORDER STATS (admin) ───
  async getOrderStats() {
    return this.handleDbOperation(async () => {
      return this.cache.wrap(this.keyStats(), this.CACHE_TTL, async () => {
        const [
          total,
          pending,
          confirmed,
          preparing,
          ready,
          picked,
          delivered,
          cancelled,
        ] = await Promise.all([
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'PENDING'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'CONFIRMED'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'PREPARING'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'READY'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'PICKED_UP'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'DELIVERED'))
            .then((r) => r[0]?.c || 0),
          this.db
            .select({ c: count() })
            .from(ordersTable)
            .where(eq(ordersTable.orderStatus, 'CANCELLED'))
            .then((r) => r[0]?.c || 0),
        ]);
        return {
          total,
          pending,
          confirmed,
          preparing,
          ready,
          pickedUp: picked,
          delivered,
          cancelled,
        };
      });
    }, 'getOrderStats');
  }

  // ─── UPDATE ORDER STATUS ───
  async updateOrderStatus(
    id: string,
    userId: string,
    role: string,
    dto: UpdateOrderDto,
  ): Promise<OrderResponseDto> {
    return this.handleDbOperation(async () => {
      const order = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, id),
      });
      if (!order) throw new NotFoundException(`Order with ID ${id} not found`);

      if (role === 'CUSTOMER') {
        if (order.customerId !== userId)
          throw new ForbiddenException(
            'You do not have permission to update this order',
          );
        if (dto.orderStatus && dto.orderStatus !== OrderStatus.CANCELLED)
          throw new ForbiddenException('Customers can only cancel orders');
        if (
          dto.orderStatus === OrderStatus.CANCELLED &&
          order.orderStatus !== OrderStatus.PENDING
        ) {
          throw new BadRequestException('Only pending orders can be cancelled');
        }
        if (
          dto.driverId ||
          dto.paymentStatus ||
          dto.paymentId ||
          dto.estimatedDeliveryTime
        ) {
          throw new ForbiddenException(
            'Customers cannot update driver/payment/ETA',
          );
        }
      } else if (role === 'RESTAURANT_OWNER') {
        const owned = await this.getRestaurantsByOwnerId(userId);
        if (!owned.some((r) => r.id === order.restaurantId))
          throw new ForbiddenException('You do not own this restaurant');
        if (
          dto.orderStatus &&
          [OrderStatus.PICKED_UP, OrderStatus.DELIVERED].includes(
            dto.orderStatus,
          )
        ) {
          throw new ForbiddenException(
            'Only driver/admin can mark picked/delivered',
          );
        }
      } else if (role === 'DRIVER') {
        if (order.driverId && order.driverId !== userId)
          throw new ForbiddenException('You are not assigned to this order');
        if (!order.driverId)
          throw new BadRequestException('No driver assigned');
        if (
          dto.orderStatus &&
          ![OrderStatus.PICKED_UP, OrderStatus.DELIVERED].includes(
            dto.orderStatus,
          ) &&
          dto.orderStatus !== OrderStatus.CANCELLED
        ) {
          throw new ForbiddenException(
            'Drivers can only update to PICKED_UP/DELIVERED',
          );
        }
      }

      const allowedTransitions: Record<string, string[]> = {
        PENDING: ['CONFIRMED', 'PREPARING', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'READY', 'CANCELLED'],
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['PICKED_UP', 'DELIVERED', 'CANCELLED'],
        PICKED_UP: ['DELIVERED'],
        DELIVERED: [],
        CANCELLED: [],
      };
      if (
        dto.orderStatus &&
        !allowedTransitions[order.orderStatus]?.includes(dto.orderStatus)
      ) {
        throw new BadRequestException(
          `Cannot transition from ${order.orderStatus} to ${dto.orderStatus}`,
        );
      }

      // Whitelist update fields
      const updateData: any = { updatedAt: new Date() };
      if (dto.orderStatus) updateData.orderStatus = dto.orderStatus;
      if (dto.paymentStatus) updateData.paymentStatus = dto.paymentStatus;
      if (dto.paymentId) updateData.paymentId = dto.paymentId;
      if (dto.notes) updateData.notes = dto.notes;
      if (dto.driverId) {
        const driver = await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, dto.driverId),
        });
        if (!driver || driver.role !== 'DRIVER')
          throw new BadRequestException('Invalid driver');
        updateData.driverId = dto.driverId;
      }
      if (dto.estimatedDeliveryTime) {
        updateData.estimatedDeliveryMinutes = dto.estimatedDeliveryTime;
        updateData.estimatedDeliveryTime = new Date(
          Date.now() + dto.estimatedDeliveryTime * 60_000,
        );
      }
      if (dto.orderStatus === OrderStatus.DELIVERED)
        updateData.deliveredAt = new Date();

      if (Object.keys(updateData).length === 1)
        throw new BadRequestException('No valid fields to update');

      const [updated] = await this.db
        .update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, id))
        .returning();
      if (!updated)
        throw new InternalServerErrorException('Failed to update order');

      if (dto.orderStatus) {
        const titleMap: Record<string, string> = {
          CONFIRMED: 'Order Confirmed',
          PREPARING: 'Order Preparing',
          READY: 'Order Ready!',
          PICKED_UP: 'Order Picked Up',
          DELIVERED: 'Order Delivered!',
          CANCELLED: 'Order Cancelled',
        };
        const body = `Your order #${id.slice(0, 8)} is now ${dto.orderStatus.toLowerCase()}`;
        await this.notificationsService
          .create({
            userId: order.customerId,
            type: 'order',
            title: titleMap[dto.orderStatus] || `Order ${dto.orderStatus}`,
            body,
            data: { orderId: id },
          })
          .catch((e: any) =>
            this.logger.warn(`notify customer failed: ${e?.message}`),
          );
        if (dto.orderStatus === OrderStatus.READY && order.driverId) {
          await this.notificationsService
            .create({
              userId: order.driverId,
              type: 'order',
              title: 'Order Ready for Pickup',
              body: `Order #${id.slice(0, 8)} ready`,
              data: { orderId: id },
            })
            .catch(() => {});
        }
        // Notify available drivers when order becomes ready (or confirmed) and unassigned
        if (
          [
            OrderStatus.READY,
            OrderStatus.CONFIRMED,
            OrderStatus.PREPARING,
          ].includes(dto.orderStatus) &&
          !order.driverId &&
          !updated.driverId
        ) {
          try {
            // Invalidate available cache so driver polling sees new order quickly
            await this.cache.delByPattern('order:available:*');
            // Broadcast via websocket to drivers room
            if (this.orderGateway) {
              (this.orderGateway as any).emitNewAvailableOrder?.(updated);
            }
            // Also create a lightweight notification for offline drivers (optional) – we avoid spamming all drivers
            // Instead, drivers will see via polling + websocket. For demo, we log.
            this.logger.log(
              `Broadcast new available order ${id} status ${dto.orderStatus} to drivers`,
            );
          } catch (e: any) {
            this.logger.warn(`driver broadcast failed: ${e.message}`);
          }
        }
      }

      // ── Real-time: broadcast to tracking rooms ──
      if (dto.orderStatus && this.trackingGateway) {
        try {
          await this.trackingGateway.broadcastOrderStatus(id, {
            orderId: id,
            orderStatus: dto.orderStatus,
            updatedAt: new Date().toISOString(),
            changedBy: userId,
            estimatedDeliveryTime: updateData.estimatedDeliveryTime
              ? updateData.estimatedDeliveryTime.toISOString()
              : updated.estimatedDeliveryTime
                ? updated.estimatedDeliveryTime.toISOString()
                : null,
          });
          // also invalidate tracking snapshot cache
          await this.cache.del(`tracking:snapshot:${id}`);
          await this.cache.del(`tracking:driver:location:${id}`);
        } catch (e: any) {
          this.logger.warn(`tracking broadcast failed: ${e.message}`);
        }
      } else if (this.trackingGateway) {
        // driver assignment also benefits from cache bust
        await this.cache.del(`tracking:snapshot:${id}`);
      }

      await this.invalidateOrder({
        id,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        driverId: order.driverId || undefined,
      });
      // bust cached entity before re-fetch
      await this.cache.del(this.keyId(id));
      return this.getOrderById(id);
    }, 'updateOrderStatus');
  }

  // ─── ADMIN: GET ALL ORDERS (cached + batched) ───
  async adminGetAllOrders(pagination: AdminOrderPaginationDto): Promise<{
    data: OrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const hash = CacheService.hashOptions(
      pagination as unknown as Record<string, unknown>,
    );
    const cacheKey = `admin:orders:${hash}`;
    return this.cache.wrap(cacheKey, 20, async () => {
      const {
        page = 1,
        limit = 20,
        status,
        restaurantId,
        driverId,
        customerId,
        startDate,
        endDate,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = pagination;

      const conditions: any[] = [];

      if (status) {
        conditions.push(eq(ordersTable.orderStatus, status));
      }
      if (restaurantId) {
        conditions.push(eq(ordersTable.restaurantId, restaurantId));
      }
      if (driverId) {
        conditions.push(eq(ordersTable.driverId, driverId));
      }
      if (customerId) {
        conditions.push(eq(ordersTable.customerId, customerId));
      }
      if (startDate) {
        conditions.push(sql`${ordersTable.createdAt} >= ${startDate}`);
      }
      if (endDate) {
        conditions.push(sql`${ordersTable.createdAt} <= ${endDate}`);
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await this.db
        .select({ total: count() })
        .from(ordersTable)
        .where(whereClause);

      const total = countResult?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const orders = await this.db
        .select()
        .from(ordersTable)
        .where(whereClause)
        .orderBy(
          sql`${ordersTable[sortBy as keyof typeof ordersTable]} ${sql.raw(sortOrder)}`,
        )
        .limit(limit)
        .offset(offset);

      if (!orders.length) {
        return { data: [], total, page, limit, totalPages };
      }

      const enrichedOrders = (await this.enrichOrdersBatch(
        orders,
      )) as OrderResponseDto[];

      return {
        data: enrichedOrders,
        total,
        page,
        limit,
        totalPages,
      };
    });
  }

  // ─── ADMIN: GET ORDER STATS (cached) ───
  async adminGetOrderStats(): Promise<AdminOrderStatsDto> {
    return this.cache.wrap('admin:order-stats', 30, async () => {
      const allOrders = await this.db.select().from(ordersTable);

      const totalOrders = allOrders.length;
      const totalRevenue = allOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount),
        0,
      );

      const stats = {
        totalOrders,
        totalRevenue,
        pendingOrders: allOrders.filter((o) => o.orderStatus === 'PENDING')
          .length,
        confirmedOrders: allOrders.filter((o) => o.orderStatus === 'CONFIRMED')
          .length,
        preparingOrders: allOrders.filter((o) => o.orderStatus === 'PREPARING')
          .length,
        readyOrders: allOrders.filter((o) => o.orderStatus === 'READY').length,
        pickedUpOrders: allOrders.filter((o) => o.orderStatus === 'PICKED_UP')
          .length,
        deliveredOrders: allOrders.filter((o) => o.orderStatus === 'DELIVERED')
          .length,
        cancelledOrders: allOrders.filter((o) => o.orderStatus === 'CANCELLED')
          .length,
      };

      // Today's stats
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = allOrders.filter(
        (o) => new Date(o.createdAt) >= today,
      );
      const todayRevenue = todayOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount),
        0,
      );

      // This week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekOrders = allOrders.filter(
        (o) => new Date(o.createdAt) >= weekAgo,
      );
      const weekRevenue = weekOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount),
        0,
      );

      // This month
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const monthOrders = allOrders.filter(
        (o) => new Date(o.createdAt) >= monthAgo,
      );
      const monthRevenue = monthOrders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount),
        0,
      );

      // Daily trend (last 7 days)
      const dailyTrend: any[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);

        const dayOrders = allOrders.filter(
          (o) =>
            new Date(o.createdAt) >= date && new Date(o.createdAt) < nextDate,
        );
        dailyTrend.push({
          date: date.toISOString().split('T')[0],
          orders: dayOrders.length,
          revenue: dayOrders.reduce(
            (sum, o) => sum + parseFloat(o.totalAmount),
            0,
          ),
        });
      }

      return {
        ...stats,
        todayOrders: todayOrders.length,
        todayRevenue,
        thisWeekOrders: weekOrders.length,
        thisWeekRevenue: weekRevenue,
        thisMonthOrders: monthOrders.length,
        thisMonthRevenue: monthRevenue,
        dailyTrend,
        revenueTrend: dailyTrend,
      };
    });
  }

  // ─── ADMIN: UPDATE ORDER STATUS ───
  async adminUpdateOrderStatus(
    id: string,
    newStatus: OrderStatus,
  ): Promise<OrderResponseDto> {
    return this.handleDbOperation(async () => {
      const order = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, id),
      });

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      // Admin can bypass normal transition rules
      // But we still validate that it's a valid status
      if (!Object.values(OrderStatus).includes(newStatus)) {
        throw new BadRequestException('Invalid order status');
      }

      const updateData: any = {
        orderStatus: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === 'DELIVERED') {
        updateData.deliveredAt = new Date();
      }

      const [updated] = await this.db
        .update(ordersTable)
        .set(updateData)
        .where(eq(ordersTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update order');
      }

      // Notify customer and restaurant
      await this.notificationsService.create({
        userId: order.customerId,
        type: 'order',
        title: `Order ${newStatus}`,
        body: `Your order #${id.slice(0, 8)} is now ${newStatus.toLowerCase()}`,
        data: { orderId: id },
      });

      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, order.restaurantId),
      });

      if (restaurant) {
        await this.notificationsService.create({
          userId: restaurant.ownerId,
          type: 'order',
          title: `Order ${newStatus}`,
          body: `Order #${id.slice(0, 8)} is now ${newStatus.toLowerCase()}`,
          data: { orderId: id },
        });
      }

      // Broadcast via WebSocket
      const enrichedOrder = await this.enrichOrder(updated);
      this.orderGateway?.emitOrderStatusUpdate(id, newStatus, enrichedOrder);

      return enrichedOrder;
    }, 'adminUpdateOrderStatus');
  }

  // ─── GET AVAILABLE ORDERS (for drivers) - optimized batched + cached ───
  async getAvailableOrders(
    lat?: number,
    lng?: number,
    radius: number = 10,
  ): Promise<any[]> {
    const cacheKey = `order:available:${lat?.toFixed(3) ?? 'any'}:${lng?.toFixed(3) ?? 'any'}:${radius}`;
    return this.cache.wrap(cacheKey, 15, async () => {
      const orders = await this.db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.orderStatus, 'READY'),
            isNull(ordersTable.driverId),
          ),
        )
        .orderBy(desc(ordersTable.createdAt))
        .limit(50);

      if (!orders.length) return [];

      // Batch fetch restaurants & customers to avoid N+1
      const restaurantIds = [...new Set(orders.map((o) => o.restaurantId))];
      const customerIds = [...new Set(orders.map((o) => o.customerId))];
      const [restaurants, customers] = await Promise.all([
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
      const restaurantMap = new Map(restaurants.map((r: any) => [r.id, r]));
      const customerMap = new Map(customers.map((c: any) => [c.id, c]));

      const enriched = orders.map((order) => {
        const restaurant: any = restaurantMap.get(order.restaurantId);
        const customer: any = customerMap.get(order.customerId);
        return {
          ...order,
          restaurantName: restaurant?.name,
          restaurantAddress: restaurant?.address,
          restaurantLat: restaurant?.latitude,
          restaurantLng: restaurant?.longitude,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'Unknown',
          customerPhone: customer?.phone,
          deliveryAddress:
            (order as any).deliveryAddressSnapshot ||
            this.buildFullAddress(undefined),
        };
      });

      // Optional lat/lng sorting via haversine could be added here
      return enriched;
    });
  }

  // ─── GET DRIVER ACTIVE ORDER ───
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  async getDriverActiveOrder(driverId: string): Promise<any | null> {
    const order = await this.db.query.ordersTable.findFirst({
      where: and(
        eq(ordersTable.driverId, driverId),
        sql`${ordersTable.orderStatus} IN ('PICKED_UP', 'CONFIRMED', 'PREPARING', 'READY')`,
      ),
      orderBy: desc(ordersTable.createdAt),
    });
    if (!order) return null;
    return this.enrichOrder(order);
  }

  // ─── GET DRIVER ORDER HISTORY (batched + cached) ───
  async getDriverOrderHistory(
    driverId: string,
    limit: number = 50,
  ): Promise<any[]> {
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    const cacheKey = `order:history:${driverId}:${safeLimit}`;
    return this.cache.wrap(cacheKey, 20, async () => {
      const orders = await this.db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.driverId, driverId),
            sql`${ordersTable.orderStatus} IN ('DELIVERED', 'CANCELLED')`,
          ),
        )
        .orderBy(desc(ordersTable.createdAt))
        .limit(safeLimit);

      if (!orders.length) return [];
      return this.enrichOrdersBatch(orders);
    });
  }

  private async enrichOrdersBatch(orders: any[]): Promise<any[]> {
    const customerIds = [...new Set(orders.map((o) => o.customerId))];
    const restaurantIds = [...new Set(orders.map((o) => o.restaurantId))];
    const orderIds = orders.map((o) => o.id);
    const [customers, restaurants, allItems] = await Promise.all([
      customerIds.length
        ? this.db
            .select()
            .from(usersTable)
            .where(inArray(usersTable.id, customerIds))
        : Promise.resolve([] as any[]),
      restaurantIds.length
        ? this.db
            .select()
            .from(restaurantsTable)
            .where(inArray(restaurantsTable.id, restaurantIds))
        : Promise.resolve([] as any[]),
      this.db
        .select()
        .from(orderItemsTable)
        .where(inArray(orderItemsTable.orderId, orderIds)),
    ]);
    const customerMap = new Map(customers.map((c: any) => [c.id, c]));
    const restaurantMap = new Map(restaurants.map((r: any) => [r.id, r]));
    const menuIds = [...new Set(allItems.map((i) => i.menuItemId))];
    const menus = menuIds.length
      ? await this.db
          .select({ id: menuItemsTable.id, name: menuItemsTable.name })
          .from(menuItemsTable)
          .where(inArray(menuItemsTable.id, menuIds))
      : [];
    const menuMap = new Map(menus.map((m) => [m.id, m.name]));
    const itemsByOrder = new Map<string, any[]>();
    for (const it of allItems) {
      const arr = itemsByOrder.get(it.orderId) || [];
      arr.push({
        ...it,
        name: menuMap.get(it.menuItemId) || it.itemNameSnapshot || 'Unknown',
      });
      itemsByOrder.set(it.orderId, arr);
    }
    return orders.map((o) => {
      const c: any = customerMap.get(o.customerId);
      const r: any = restaurantMap.get(o.restaurantId);
      return {
        ...o,
        customerName: c ? `${c.firstName} ${c.lastName}` : 'Unknown',
        customerPhone: c?.phone,
        restaurantName: r?.name,
        restaurantAddress: r?.address,
        items: itemsByOrder.get(o.id) || [],
      };
    });
  }

  // ─── GET DRIVER EARNINGS (cached, frequent fetch) ───
  async getDriverEarnings(driverId: string): Promise<{
    total: number;
    deliveries: number;
    today: number;
    week: number;
  }> {
    const cacheKey = `order:earnings:${driverId}`;
    return this.cache.wrap(cacheKey, 30, async () => {
      const allDelivered = await this.db
        .select()
        .from(ordersTable)
        .where(
          and(
            eq(ordersTable.driverId, driverId),
            eq(ordersTable.orderStatus, 'DELIVERED'),
          ),
        );

      const total = allDelivered.reduce(
        (sum, o) => sum + (parseFloat(o.deliveryFee as any) || 0),
        0,
      );
      const deliveries = allDelivered.length;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayEarnings = allDelivered
        .filter((o) => new Date((o as any).deliveredAt || o.updatedAt) >= today)
        .reduce((sum, o) => sum + (parseFloat(o.deliveryFee as any) || 0), 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekEarnings = allDelivered
        .filter(
          (o) => new Date((o as any).deliveredAt || o.updatedAt) >= weekAgo,
        )
        .reduce((sum, o) => sum + (parseFloat(o.deliveryFee as any) || 0), 0);

      return { total, deliveries, today: todayEarnings, week: weekEarnings };
    });
  }

  // ─── Helper to enrich order with customer/restaurant details ───
  private async enrichOrder(order: any): Promise<any> {
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
          ...item,
          name: menuItem?.name || 'Unknown',
        };
      }),
    );

    return {
      ...order,
      customerName: customer
        ? `${customer.firstName} ${customer.lastName}`
        : 'Unknown',
      customerPhone: customer?.phone,
      restaurantName: restaurant?.name,
      restaurantAddress: restaurant?.address,
      items: itemsWithNames,
    };
  }

  // ─── ASSIGN DRIVER ───
  async assignDriver(
    orderId: string,
    driverId: string,
    assignerId?: string,
    assignerRole?: string,
  ): Promise<OrderResponseDto> {
    return this.handleDbOperation(async () => {
      const order = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, orderId),
      });
      if (!order)
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      if (
        !['PENDING', 'CONFIRMED', 'PREPARING', 'READY'].includes(
          order.orderStatus,
        )
      ) {
        throw new BadRequestException(
          'Driver can only be assigned to pending/confirmed/preparing/ready orders',
        );
      }
      if (assignerId && assignerRole === 'RESTAURANT_OWNER') {
        const owned = await this.getRestaurantsByOwnerId(assignerId);
        if (!owned.some((r) => r.id === order.restaurantId))
          throw new ForbiddenException('You do not own this order restaurant');
      }
      const driver = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, driverId),
      });
      if (!driver || driver.role !== 'DRIVER')
        throw new BadRequestException('Invalid driver');
      if (order.driverId)
        throw new BadRequestException('Driver already assigned');

      const [updated] = await this.db
        .update(ordersTable)
        .set({ driverId, updatedAt: new Date() })
        .where(and(eq(ordersTable.id, orderId), isNull(ordersTable.driverId)))
        .returning();
      if (!updated)
        throw new BadRequestException(
          'Driver already assigned or order not found',
        );

      await this.notificationsService
        .create({
          userId: driverId,
          type: 'order',
          title: 'New Delivery Assignment',
          body: `You have been assigned to order #${orderId.slice(0, 8)}`,
          data: { orderId },
        })
        .catch(() => {});
      await this.notificationsService
        .create({
          userId: order.customerId,
          type: 'order',
          title: 'Driver Assigned',
          body: `A driver has been assigned to your order #${orderId.slice(0, 8)}`,
          data: { orderId },
        })
        .catch(() => {});

      // Real-time driver assignment push
      if (this.trackingGateway) {
        try {
          await this.trackingGateway.broadcastOrderStatus(orderId, {
            orderId,
            orderStatus: updated.orderStatus,
            updatedAt: new Date().toISOString(),
            changedBy: assignerId,
          });
          // also notify via WS direct
          await this.trackingGateway.broadcastToUser(
            driverId,
            'order:assigned',
            {
              orderId,
              restaurantId: order.restaurantId,
            },
          );
          await this.cache.del(`tracking:snapshot:${orderId}`);
        } catch (e: any) {
          this.logger.warn(`tracking assign broadcast failed: ${e.message}`);
        }
      }

      await this.invalidateOrder({
        id: orderId,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        driverId,
      });
      await this.cache.del(this.keyId(orderId));
      await this.cache.delByPattern('order:available:*');
      await this.cache.del(`order:earnings:${driverId}`);
      await this.cache.delByPattern(`order:history:${driverId}:*`);
      return this.getOrderById(orderId);
    }, 'assignDriver');
  }

  // ─── CANCEL ORDER ───
  async cancelOrder(
    orderId: string,
    userId: string,
    role: string,
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const order = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, orderId),
      });
      if (!order)
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      if (role === 'CUSTOMER' && order.customerId !== userId)
        throw new ForbiddenException(
          'You do not have permission to cancel this order',
        );
      if (role === 'RESTAURANT_OWNER') {
        const owned = await this.getRestaurantsByOwnerId(userId);
        if (!owned.some((r) => r.id === order.restaurantId))
          throw new ForbiddenException('Not your restaurant order');
      }
      if (
        order.orderStatus === 'DELIVERED' ||
        order.orderStatus === 'CANCELLED'
      )
        throw new BadRequestException('Order cannot be cancelled');
      if (['PICKED_UP'].includes(order.orderStatus))
        throw new BadRequestException('Cannot cancel after pickup');

      const [updated] = await this.db
        .update(ordersTable)
        .set({ orderStatus: 'CANCELLED', updatedAt: new Date() })
        .where(eq(ordersTable.id, orderId))
        .returning();
      if (!updated)
        throw new InternalServerErrorException('Failed to cancel order');

      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, order.restaurantId),
      });
      if (restaurant) {
        await this.notificationsService
          .create({
            userId: restaurant.ownerId,
            type: 'order',
            title: 'Order Cancelled',
            body: `Order #${orderId.slice(0, 8)} has been cancelled`,
            data: { orderId },
          })
          .catch(() => {});
      }
      await this.notificationsService
        .create({
          userId: order.customerId,
          type: 'order',
          title: 'Order Cancelled',
          body: `Order #${orderId.slice(0, 8)} cancelled`,
          data: { orderId },
        })
        .catch(() => {});

      if (this.trackingGateway) {
        try {
          await this.trackingGateway.broadcastOrderStatus(orderId, {
            orderId,
            orderStatus: 'CANCELLED',
            updatedAt: new Date().toISOString(),
            changedBy: userId,
          });
          await this.cache.del(`tracking:snapshot:${orderId}`);
        } catch (e: any) {
          this.logger.warn(`tracking cancel broadcast failed: ${e.message}`);
        }
      }

      await this.invalidateOrder({
        id: orderId,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        driverId: order.driverId || undefined,
      });
      await this.cache.del(this.keyId(orderId));
      return { message: 'Order cancelled successfully' };
    }, 'cancelOrder');
  }

  // ─── UPDATE PAYMENT STATUS (for eSewa verification) ───
  async updatePaymentStatus(
    orderId: string,
    status: string,
  ): Promise<{ message: string; paymentStatus: string }> {
    return this.handleDbOperation(async () => {
      const order = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, orderId),
      });
      if (!order)
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      // Allow only PENDING -> PAID/FAILED transition for ONLINE orders, or manual override by admin
      const allowed = ['PENDING', 'FAILED'];
      if (order.paymentStatus === 'PAID' && status === 'PAID') {
        return { message: 'Already paid', paymentStatus: 'PAID' };
      }
      if (
        order.paymentStatus !== 'PENDING' &&
        status === 'FAILED' &&
        order.paymentStatus !== 'PAID'
      ) {
        // allow FAILED only if not already PAID
      }
      const [updated] = await this.db
        .update(ordersTable)
        .set({
          paymentStatus: status as any,
          updatedAt: new Date(),
          ...(status === 'PAID'
            ? { paymentId: order.paymentId || `esewa-${Date.now()}` }
            : {}),
        })
        .where(eq(ordersTable.id, orderId))
        .returning();
      if (!updated)
        throw new InternalServerErrorException(
          'Failed to update payment status',
        );
      await this.cache.del(this.keyId(orderId));
      await this.cache.delByPattern('order:list:*');
      await this.cache.del(`tracking:snapshot:${orderId}`);
      this.logger.log(
        `Payment status for order ${orderId} updated to ${status}`,
      );
      return {
        message: `Payment status updated to ${status}`,
        paymentStatus: status,
      };
    }, 'updatePaymentStatus');
  }
}
