/* eslint-disable no-empty */
import { DynamicTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { OrdersService } from '../order/order.service';

export const orderContext = new AsyncLocalStorage<{ userId: string }>();

@Injectable()
export class OrderTools {
  constructor(private readonly ordersService: OrdersService) {}

  // Legacy setter kept for compatibility – now no-op (context is via AsyncLocalStorage)
  setCurrentUserId(_userId: string) {}

  // ─── GET ORDER STATUS ───
  getOrderStatusTool() {
    return new DynamicTool({
      name: 'get_order_status',
      description:
        'Get the current status of an order by order ID. Requires order ID as a UUID string. Example input: "550e8400-e29b-41d4-a716-446655440000"',
      func: async (input: string) => {
        try {
          const currentUserId = orderContext.getStore()?.userId;
          const orderId = this.extractId(input);
          if (!orderId || !this.isUUID(orderId))
            return JSON.stringify({ error: 'Invalid order ID format' });
          const order = await this.ordersService.getOrderById(orderId);
          if (currentUserId && order.customerId !== currentUserId) {
            return JSON.stringify({ error: 'Order not found or not yours' });
          }
          return JSON.stringify({
            id: order.id,
            status: order.orderStatus,
            estimatedDelivery: order.estimatedDeliveryTime,
            totalAmount: order.totalAmount,
          });
        } catch {
          return JSON.stringify({
            error: 'Order not found. Please check the order ID.',
          });
        }
      },
    });
  }

  // ─── GET ORDER DETAILS ───
  getOrderDetailsTool() {
    return new DynamicTool({
      name: 'get_order_details',
      description:
        'Get complete details of an order by order ID. Includes items, customer info, and status. Input is order ID UUID.',
      func: async (input: string) => {
        try {
          const currentUserId = orderContext.getStore()?.userId;
          const orderId = this.extractId(input);
          if (!orderId || !this.isUUID(orderId))
            return JSON.stringify({ error: 'Invalid order ID format' });
          const order = await this.ordersService.getOrderById(orderId);
          if (currentUserId && order.customerId !== currentUserId) {
            return JSON.stringify({ error: 'Order not found or not yours' });
          }
          return JSON.stringify({
            id: order.id,
            status: order.orderStatus,
            items: order.items.map((item) => ({
              name: item.name.slice(0, 80),
              quantity: item.quantity,
              price: item.unitPrice,
            })),
            totalAmount: order.totalAmount,
            customerName: order.customerName,
            deliveryAddress: order.deliveryAddress,
            estimatedDelivery: order.estimatedDeliveryTime,
          });
        } catch {
          return JSON.stringify({
            error: 'Order not found. Please check the order ID.',
          });
        }
      },
    });
  }

  // ─── GET ORDER HISTORY ───
  getOrderHistoryTool() {
    return new DynamicTool({
      name: 'get_order_history',
      description:
        "Get the current user's recent order history. No input needed – uses authenticated user, ignores input.",
      func: async (_input: string) => {
        try {
          const currentUserId = orderContext.getStore()?.userId;
          if (!currentUserId)
            return JSON.stringify({ error: 'User not identified' });
          const orders = await this.ordersService.getOrders(
            currentUserId,
            'CUSTOMER',
            { limit: 5 },
          );
          if (!orders.data.length)
            return JSON.stringify({
              orders: [],
              message: 'No orders found yet',
            });
          return JSON.stringify({
            orders: orders.data.map((o) => ({
              id: o.id,
              status: o.orderStatus,
              totalAmount: o.totalAmount,
              restaurantName: (o.restaurantName || '').slice(0, 80),
              createdAt: o.createdAt,
            })),
          });
        } catch {
          return JSON.stringify({ error: 'Failed to get order history' });
        }
      },
    });
  }

  private isUUID(v: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      v,
    );
  }

  private extractId(input: string): string {
    if (!input) return '';
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const match = input.match(uuidRegex);
    if (match) return match[0];
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string')
        return parsed.trim().replace(/^["']|["']$/g, '');
      if (parsed?.orderId) return String(parsed.orderId).trim();
      if (parsed?.id) return String(parsed.id).trim();
    } catch {}
    return input
      .trim()
      .replace(/^["']|["']$/g, '')
      .split(/\s+/)[0]
      .slice(0, 100);
  }
}
