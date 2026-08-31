import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, desc } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  driverTrackingTable,
  driverLocationHistoryTable,
} from '../db/schema/driver-tracking.schema';
import { ordersTable } from '../db/schema/order.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { addressesTable } from '../db/schema/user.address.schema';
import { usersTable } from '../db/schema/user.schema';
import { UpdateLocationDto } from './dto/update-location.dto';
import {
  DriverLocationResponseDto,
  RouteResponseDto,
} from './dto/driver-location-response.dto';
import * as schema from '../db/schema';
import { CacheService } from '../redis/cache.service';
import axios from 'axios';

interface TrackingSnapshot {
  orderId: string;
  driver: DriverLocationResponseDto | null;
  route: RouteResponseDto | null;
  restaurant: { lat: number; lng: number; name?: string; address?: string };
  delivery: { lat: number; lng: number; address?: string };
  orderStatus: string;
  estimatedDeliveryTime?: string | null;
  estimatedDistance?: number | null;
  estimatedDuration?: number | null;
  history?: Array<{ lat: number; lng: number; recordedAt: string }>;
}

@Injectable()
export class TrackingService {
  private readonly logger = new Logger(TrackingService.name);
  private readonly OSRM_URL: string;
  private readonly OFFLINE_THRESHOLD_MS = 120_000; // 2 minutes
  private readonly LOCATION_HISTORY_LIMIT = 50;
  private readonly ROUTE_CACHE_TTL = 300; // 5 min
  private readonly DRIVER_CACHE_TTL = 90; // seconds

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
    private readonly configService: ConfigService,
  ) {
    this.OSRM_URL =
      this.configService.get<string>('OSRM_URL') ||
      'https://router.project-osrm.org';
  }

  // ─── PERMISSION CHECK ───
  async assertCanAccessOrder(orderId: string, userId: string, role: string) {
    const order = await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
    });
    if (!order) throw new NotFoundException('Order not found');

    if (role === 'ADMIN') return order;

    if (role === 'CUSTOMER') {
      if (order.customerId !== userId)
        throw new ForbiddenException('Not your order');
      return order;
    }

    if (role === 'DRIVER') {
      if (order.driverId && order.driverId !== userId)
        throw new ForbiddenException('Not assigned to this order');
      // allow driver to see even if not yet assigned when status is READY? but restrict
      if (!order.driverId)
        throw new ForbiddenException('No driver assigned yet');
      return order;
    }

    if (role === 'RESTAURANT_OWNER') {
      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, order.restaurantId),
      });
      if (!restaurant || restaurant.ownerId !== userId)
        throw new ForbiddenException('Not your restaurant order');
      return order;
    }

    // fallback: allow if user is same as customer/driver/owner checked
    return order;
  }

  // ─── UPDATE DRIVER LOCATION (persist + cache + history) ───
  async updateDriverLocation(
    driverId: string,
    dto: UpdateLocationDto,
  ): Promise<DriverLocationResponseDto> {
    // Verify order exists and driver is assigned (strict)
    const order = await this.db.query.ordersTable.findFirst({
      where: and(
        eq(ordersTable.id, dto.orderId),
        eq(ordersTable.driverId, driverId),
      ),
    });

    if (!order) {
      // Fallback: check if order exists but driver mismatch -> clearer error
      const anyOrder = await this.db.query.ordersTable.findFirst({
        where: eq(ordersTable.id, dto.orderId),
      });
      if (!anyOrder) throw new NotFoundException('Order not found');
      if (anyOrder.driverId !== driverId)
        throw new ForbiddenException('Driver not assigned to this order');
      throw new NotFoundException('Order not found or driver not assigned');
    }

    if (['DELIVERED', 'CANCELLED'].includes(order.orderStatus)) {
      throw new BadRequestException(
        `Cannot update location for ${order.orderStatus} order`,
      );
    }

    const now = new Date();

    // Upsert current location
    const [tracking] = await this.db
      .insert(driverTrackingTable)
      .values({
        driverId,
        orderId: dto.orderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        speed: dto.speed,
        heading: dto.heading,
        altitude: (dto as any).altitude,
        isOnline: true,
        lastUpdatedAt: now,
        createdAt: now,
      })
      .onConflictDoUpdate({
        target: [driverTrackingTable.driverId, driverTrackingTable.orderId],
        set: {
          latitude: dto.latitude,
          longitude: dto.longitude,
          accuracy: dto.accuracy,
          speed: dto.speed,
          heading: dto.heading,
          altitude: (dto as any).altitude,
          isOnline: true,
          lastUpdatedAt: now,
        },
      })
      .returning();

    // Async history insert (fire-and-forget, but await for consistency)
    this.db
      .insert(driverLocationHistoryTable)
      .values({
        driverId,
        orderId: dto.orderId,
        latitude: dto.latitude,
        longitude: dto.longitude,
        accuracy: dto.accuracy,
        speed: dto.speed,
        heading: dto.heading,
        recordedAt: now,
      })
      .then(() => {})
      .catch((e) => this.logger.warn(`history insert failed: ${e.message}`));

    // Trim history to keep table lean (keep last 500 per order)
    // Using simple delete of older than 24h via cron ideally; here we just leave it

    // Cache latest location for fast reads (WS and REST)
    const dtoCached: DriverLocationResponseDto = {
      latitude: tracking.latitude,
      longitude: tracking.longitude,
      lastUpdatedAt: tracking.lastUpdatedAt,
      isOnline: this.isOnline(tracking.lastUpdatedAt),
      speed: tracking.speed ?? undefined,
      heading: tracking.heading ?? undefined,
      accuracy: tracking.accuracy ?? undefined,
      altitude: (tracking as any).altitude ?? undefined,
    };
    await this.cache.set(
      this.cacheKeyDriver(dto.orderId),
      dtoCached,
      this.DRIVER_CACHE_TTL,
    );
    // Also bump order tracking snapshot cache invalidation
    await this.cache.del(this.cacheKeySnapshot(dto.orderId));

    this.logger.log(
      `Driver ${driverId} location updated for order ${dto.orderId}`,
    );
    return dtoCached;
  }

  // ─── GET DRIVER LOCATION (cache-first) ───
  async getDriverLocation(orderId: string): Promise<DriverLocationResponseDto> {
    const cached = await this.cache.get<DriverLocationResponseDto>(
      this.cacheKeyDriver(orderId),
    );
    if (cached) {
      // Re-evaluate online status based on recency
      return {
        ...cached,
        isOnline: this.isOnline(new Date(cached.lastUpdatedAt)),
      };
    }

    const tracking = await this.db.query.driverTrackingTable.findFirst({
      where: eq(driverTrackingTable.orderId, orderId),
      orderBy: [desc(driverTrackingTable.lastUpdatedAt)],
    });

    if (!tracking) {
      throw new NotFoundException('Driver location not found');
    }

    const result: DriverLocationResponseDto = {
      latitude: tracking.latitude,
      longitude: tracking.longitude,
      lastUpdatedAt: tracking.lastUpdatedAt,
      isOnline: this.isOnline(tracking.lastUpdatedAt),
      speed: tracking.speed ?? undefined,
      heading: tracking.heading ?? undefined,
      accuracy: tracking.accuracy ?? undefined,
      altitude: (tracking as any).altitude ?? undefined,
    };

    await this.cache.set(
      this.cacheKeyDriver(orderId),
      result,
      this.DRIVER_CACHE_TTL,
    );
    return result;
  }

  async getDriverLocationHistory(
    orderId: string,
    limit = 50,
  ): Promise<
    Array<{
      latitude: number;
      longitude: number;
      recordedAt: Date;
      speed?: number;
      heading?: number;
    }>
  > {
    const rows = await this.db
      .select()
      .from(driverLocationHistoryTable)
      .where(eq(driverLocationHistoryTable.orderId, orderId))
      .orderBy(desc(driverLocationHistoryTable.recordedAt))
      .limit(Math.min(limit, 200));

    return rows.map((r) => ({
      latitude: r.latitude,
      longitude: r.longitude,
      recordedAt: r.recordedAt,
      speed: r.speed ?? undefined,
      heading: r.heading ?? undefined,
    }));
  }

  // ─── CALCULATE ROUTE (cached, OSRM, fallback) ───
  async calculateRoute(
    startLat: number,
    startLng: number,
    endLat: number,
    endLng: number,
  ): Promise<RouteResponseDto> {
    if (
      [startLat, startLng, endLat, endLng].some(
        (v) => typeof v !== 'number' || Number.isNaN(v),
      )
    ) {
      throw new BadRequestException('Invalid coordinates for route');
    }

    // Round to 5 decimals for cache key stability (~1m precision)
    const key = `route:${startLat.toFixed(5)}:${startLng.toFixed(5)}:${endLat
      .toFixed(5)
      .toString()}:${endLng.toFixed(5)}`;

    const cached = await this.cache.get<RouteResponseDto>(key);
    if (cached) return cached;

    try {
      const url = `${this.OSRM_URL}/route/v1/driving/${startLng},${startLat};${endLng},${endLat}`;
      const response = await axios.get(url, {
        params: { overview: 'full', geometries: 'geojson', steps: false },
        timeout: 8000,
      });

      const data = response.data;
      if (data.code !== 'Ok' || !data.routes?.[0]) {
        throw new Error(`OSRM error: ${data.code || 'no route'}`);
      }

      const route = data.routes[0];
      const geometry: number[][] = route.geometry.coordinates.map(
        (coord: number[]) => [coord[1], coord[0]], // [lng, lat] -> [lat, lng]
      );

      const result: RouteResponseDto = {
        distance: Math.round(route.distance),
        duration: Math.round(route.duration),
        geometry,
      };

      await this.cache.set(key, result, this.ROUTE_CACHE_TTL);
      return result;
    } catch (error: any) {
      this.logger.warn(`OSRM failed: ${error.message} - fallback to haversine`);
      const distance = this.calculateDistance(
        startLat,
        startLng,
        endLat,
        endLng,
      );
      // Estimate duration at avg 30km/h city driving + 2min buffer
      const duration = Math.round((distance / 1000 / 30) * 3600) + 120;
      const fallback: RouteResponseDto = {
        distance: Math.round(distance),
        duration,
        geometry: [
          [startLat, startLng],
          [endLat, endLng],
        ],
      };
      // Cache fallback shorter to retry OSRM soon
      await this.cache.set(key, fallback, 60);
      return fallback;
    }
  }

  // ─── SNAPSHOT (advanced) ───
  async getOrderTrackingSnapshot(orderId: string): Promise<TrackingSnapshot> {
    const cached = await this.cache.get<TrackingSnapshot>(
      this.cacheKeySnapshot(orderId),
    );
    if (cached) return cached;

    const order = await this.db.query.ordersTable.findFirst({
      where: eq(ordersTable.id, orderId),
    });
    if (!order) throw new NotFoundException('Order not found');

    const [restaurant, address] = await Promise.all([
      this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, order.restaurantId),
      }),
      this.db.query.addressesTable.findFirst({
        where: eq(addressesTable.id, order.addressId),
      }),
    ]);

    // Driver location (best-effort)
    let driverLocation: DriverLocationResponseDto | null = null;
    try {
      driverLocation = await this.getDriverLocation(orderId);
    } catch {
      driverLocation = null;
    }

    // Determine route based on order status phase
    let route: RouteResponseDto | null = null;
    let estimatedDistance: number | null = null;
    let estimatedDuration: number | null = null;

    if (restaurant && address?.latitude && address?.longitude) {
      const custLat = address.latitude;
      const custLng = address.longitude;

      if (
        driverLocation &&
        ['PICKED_UP', 'READY'].includes(order.orderStatus)
      ) {
        // Driver -> Customer
        route = await this.calculateRoute(
          driverLocation.latitude,
          driverLocation.longitude,
          custLat,
          custLng,
        );
      } else if (
        driverLocation &&
        ['CONFIRMED', 'PREPARING'].includes(order.orderStatus)
      ) {
        // Restaurant -> Driver (if driver en route to pickup)
        route = await this.calculateRoute(
          restaurant.latitude,
          restaurant.longitude,
          driverLocation.latitude,
          driverLocation.longitude,
        );
      } else if (restaurant.latitude && restaurant.longitude) {
        // No driver yet: restaurant -> customer
        route = await this.calculateRoute(
          restaurant.latitude,
          restaurant.longitude,
          custLat,
          custLng,
        );
      }

      if (route) {
        estimatedDistance = route.distance;
        estimatedDuration = route.duration;
      }
    }

    const history = order.driverId
      ? await this.getDriverLocationHistory(
          orderId,
          this.LOCATION_HISTORY_LIMIT,
        ).then((h) =>
          h.map((p) => ({
            lat: p.latitude,
            lng: p.longitude,
            recordedAt: p.recordedAt.toISOString(),
          })),
        )
      : [];

    const snapshot: TrackingSnapshot = {
      orderId,
      driver: driverLocation,
      route,
      restaurant: {
        lat: restaurant?.latitude || 0,
        lng: restaurant?.longitude || 0,
        name: restaurant?.name,
        address: restaurant?.address,
      },
      delivery: {
        lat: address?.latitude || 0,
        lng: address?.longitude || 0,
        address:
          (order.deliveryAddressSnapshot as string) ||
          (address
            ? [
                address.addressLine,
                address.city,
                address.state,
                address.country,
              ]
                .filter(Boolean)
                .join(', ')
            : ''),
      },
      orderStatus: order.orderStatus,
      estimatedDeliveryTime: order.estimatedDeliveryTime
        ? order.estimatedDeliveryTime.toISOString()
        : null,
      estimatedDistance,
      estimatedDuration,
      history,
    };

    await this.cache.set(this.cacheKeySnapshot(orderId), snapshot, 10); // short TTL for live data
    return snapshot;
  }

  // Alias for REST controller backwards compat
  async getOrderTrackingData(
    orderId: string,
    userId?: string,
    role?: string,
  ): Promise<TrackingSnapshot> {
    if (userId && role) {
      await this.assertCanAccessOrder(orderId, userId, role);
    }
    return this.getOrderTrackingSnapshot(orderId);
  }

  // ─── ETA update helper ───
  async getEtaForOrder(
    orderId: string,
  ): Promise<{ distance: number; duration: number; eta: string } | null> {
    const snap = await this.getOrderTrackingSnapshot(orderId);
    if (!snap.route) return null;
    const etaDate = new Date(Date.now() + snap.route.duration * 1000);
    return {
      distance: snap.route.distance,
      duration: snap.route.duration,
      eta: etaDate.toISOString(),
    };
  }

  private isOnline(lastUpdatedAt: Date | string): boolean {
    const ms = Date.now() - new Date(lastUpdatedAt).getTime();
    return ms < this.OFFLINE_THRESHOLD_MS;
  }

  private cacheKeyDriver(orderId: string) {
    return `tracking:driver:location:${orderId}`;
  }
  private cacheKeySnapshot(orderId: string) {
    return `tracking:snapshot:${orderId}`;
  }

  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number,
  ): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
