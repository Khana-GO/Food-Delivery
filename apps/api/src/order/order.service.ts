import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class OrderService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  async create(createOrderDto: any, customerId: string) {
    // createOrderDto should contain: restaurantId, deliveryAddress, paymentMethod, items: []
    
    // Calculate total amount
    const totalAmount = createOrderDto.items.reduce((sum: number, item: any) => sum + item.price * item.qty, 0).toString();

    // The schema requires itemId and driverId to be notNull. We'll use the first item's ID as itemId, and customerId as driverId for now as a workaround for the strict schema constraints.
    const orderId = uuidv4();
    
    await this.db.insert(schema.ordersTable).values({
      id: orderId,
      customerId,
      driverId: customerId, // Workaround
      restaurantId: createOrderDto.restaurantId,
      itemId: createOrderDto.items[0]?.id || uuidv4(), // Workaround
      deliveryAddress: createOrderDto.deliveryAddress,
      paymentMethod: createOrderDto.paymentMethod || 'OFFLINE',
      totalAmount,
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

  update(id: number, updateOrderDto: UpdateOrderDto) {
    return `This action updates a #${id} order`;
  }

  remove(id: number) {
    return `This action removes a #${id} order`;
  }
}
