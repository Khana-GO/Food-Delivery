/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql, desc, asc, count, inArray } from 'drizzle-orm';
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
import {
  OrderResponseDto,
  OrderItemResponseDto,
} from './dto/order-response.dto';
import { OrderPaginationDto } from './dto/order-pagination.dto';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';
import { NotificationsService } from '../notification/notification.service';

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
        (order.deliveryAddressSnapshot as string) || address?.fullAddress || '',
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
        } as any);

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
      const deliverySnapshot = address.fullAddress;

      // Validate ONLINE needs paymentId
      if (dto.paymentMethod === 'ONLINE' && !dto.paymentId) {
        throw new BadRequestException('paymentId required for ONLINE payment');
      }

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
              paymentStatus:
                dto.paymentMethod === 'ONLINE' && dto.paymentId
                  ? 'PAID'
                  : 'PENDING',
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
          quantity:
            (it.quantity as unknown as number) ??
            parseInt(String(it.quantity), 10),
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
        PENDING: ['CONFIRMED', 'CANCELLED'],
        CONFIRMED: ['PREPARING', 'CANCELLED'],
        PREPARING: ['READY', 'CANCELLED'],
        READY: ['PICKED_UP', 'CANCELLED'],
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
        order.orderStatus !== 'PENDING' &&
        order.orderStatus !== 'CONFIRMED'
      ) {
        throw new BadRequestException(
          'Driver can only be assigned to pending or confirmed orders',
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
        .where(eq(ordersTable.id, orderId))
        .returning();
      if (!updated)
        throw new InternalServerErrorException('Failed to assign driver');

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

      await this.invalidateOrder({
        id: orderId,
        customerId: order.customerId,
        restaurantId: order.restaurantId,
        driverId,
      });
      await this.cache.del(this.keyId(orderId));
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
}
