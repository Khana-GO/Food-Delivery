/* eslint-disable no-empty */
import { DynamicTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { TrackingService } from '../tracking/tracking.service';
import { RestaurantsService } from '../restaurant/restaurant.service';
import { OrdersService } from '../order/order.service';

export const deliveryContext = new AsyncLocalStorage<{ userId: string }>();

@Injectable()
export class DeliveryTools {
  constructor(
    private readonly trackingService: TrackingService,
    private readonly restaurantsService: RestaurantsService,
    private readonly ordersService: OrdersService,
  ) {}

  private isUUID(v: string): boolean {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      v,
    );
  }
  private extractId(input: string): string {
    if (!input) return '';
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const m = input.match(uuidRegex);
    if (m) return m[0];
    try {
      const p = JSON.parse(input);
      if (typeof p === 'string') return p.trim().replace(/^["']|["']$/g, '');
      if (p?.orderId) return String(p.orderId).trim();
      if (p?.id) return String(p.id).trim();
    } catch {}
    return input
      .trim()
      .replace(/^["']|["']$/g, '')
      .split(/\s+/)[0]
      .slice(0, 100);
  }

  // ─── GET DELIVERY STATUS ───
  getDeliveryStatusTool() {
    return new DynamicTool({
      name: 'get_delivery_status',
      description:
        'Get real-time delivery status including driver location and ETA for an order. Input is order UUID.',
      func: async (input: string) => {
        try {
          const orderId = this.extractId(input);
          if (!orderId || !this.isUUID(orderId))
            return JSON.stringify({ error: 'Invalid order ID' });
          const currentUserId = deliveryContext.getStore()?.userId;
          // Ownership check – prevent exfiltration of any order's driver location
          if (currentUserId) {
            try {
              const order = await this.ordersService.getOrderById(orderId);
              if (order.customerId !== currentUserId)
                return JSON.stringify({
                  error: 'Order not found or not yours',
                });
            } catch {
              return JSON.stringify({ error: 'Order not found' });
            }
          }
          const tracking =
            await this.trackingService.getOrderTrackingData(orderId);
          // Sanitize coordinates to 4 decimals to limit precision while keeping useful
          const driver = tracking.driver
            ? {
                lat: Math.round(tracking.driver.latitude * 10000) / 10000,
                lng: Math.round(tracking.driver.longitude * 10000) / 10000,
                lastUpdated: tracking.driver.lastUpdatedAt,
              }
            : null;
          return JSON.stringify({
            orderId,
            status: tracking.driver ? 'Driver assigned' : 'Waiting for driver',
            driverLocation: driver,
            routeDistance: tracking.route?.distance || 0,
            estimatedDuration: tracking.route?.duration || 0,
          });
        } catch {
          return JSON.stringify({ error: 'Failed to get delivery status' });
        }
      },
    });
  }

  // ─── GET DELIVERY TIME ───
  getDeliveryTimeTool() {
    return new DynamicTool({
      name: 'get_delivery_time',
      description:
        'Get estimated delivery time for a restaurant. Uses restaurant ID (UUID).',
      func: async (input: string) => {
        try {
          const id = this.extractId(input);
          if (!id || !this.isUUID(id))
            return JSON.stringify({ error: 'Invalid restaurant ID' });
          const restaurant = await this.restaurantsService.findById(id);
          return JSON.stringify({
            estimatedTime: restaurant.estimatedDeliveryTime || 30,
            isOpen: restaurant.isOpen,
            distance: 'Approximately 2 km',
          });
        } catch {
          return JSON.stringify({ error: 'Restaurant not found' });
        }
      },
    });
  }
}
