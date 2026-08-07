import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class OrderService {
  constructor(
    @Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>,
    private readonly mapsService: MapsService
  ) {}

  async create(createOrderDto: any, customerId: string) {
    // createOrderDto should contain: restaurantId, deliveryAddress, paymentMethod, items: []
    
    // Calculate total amount
    const totalAmount = createOrderDto.items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0).toString();

    // Fetch restaurant to get its location for distance calculation
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(schema.restaurantsTable.id, createOrderDto.restaurantId)
    });

    let distance: string | null = null;
    let estimatedDeliveryTime: number | null = null;

    if (restaurant && restaurant.latitude && restaurant.longitude && createOrderDto.deliveryAddress) {
      const origin = { latitude: restaurant.latitude, longitude: restaurant.longitude };
      const dest = createOrderDto.deliveryAddress;
      const metrics = await this.mapsService.getDistanceAndDuration(origin, dest);
      if (metrics) {
        distance = (metrics.distanceMeters / 1609.34).toFixed(2); // converting meters to miles
        estimatedDeliveryTime = Math.round(metrics.durationSeconds / 60); // converting seconds to minutes
      }
    }

    const orderId = uuidv4();
    
    await this.db.insert(schema.ordersTable).values({
      id: orderId,
      customerId,
      restaurantId: createOrderDto.restaurantId,
      deliveryAddress: createOrderDto.deliveryAddress,
      paymentMethod: createOrderDto.paymentMethod || 'OFFLINE',
      totalAmount,
      distance,
      estimatedDeliveryTime,
      orderStatus: 'PENDING',
      paymentStatus: 'PENDING',
    });

    // Insert order items
    if (createOrderDto.items && createOrderDto.items.length > 0) {
      for (const item of createOrderDto.items) {
        await this.db.insert(schema.orderItem).values({
          orderId,
          itemId: item.id,
          quantity: item.qty.toString(),
          unitPrice: item.price.toString(),
        });
      }
    }

    return { success: true, orderId };
  }

  async findAllForCustomer(customerId: string) {
    return await this.db.query.ordersTable.findMany({
      where: eq(schema.ordersTable.customerId, customerId),
      orderBy: (orders, { desc }) => [desc(orders.createdAt)],
    });
  }

  findOne(id: string) {
    return this.db.query.ordersTable.findFirst({
      where: eq(schema.ordersTable.id, id),
    });
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    return await this.db.update(schema.ordersTable)
      .set(updateOrderDto as any)
      .where(eq(schema.ordersTable.id, id))
      .returning();
  }

  async remove(id: string) {
    return await this.db.delete(schema.ordersTable)
      .where(eq(schema.ordersTable.id, id))
      .returning();
  }
}
