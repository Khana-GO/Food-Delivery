import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { eq, sql, and, count, sum, inArray } from 'drizzle-orm';
import { ordersTable } from '../db/schema/order.schema';
import { orderItemsTable } from '../db/schema/order.items.schema';
import { usersTable } from '../db/schema/user.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { driverTrackingTable } from '../db/schema/driver-tracking.schema';
import * as schema from '../db/schema';
import { CacheService } from '../redis/cache.service';
import { PlatformMetricsDto } from './dto/platform-metrics.dto';
import { DriverAnalyticsDto } from './dto/driver-analytics.dto';
import {
  RestaurantAnalyticsDto,
  RestaurantAnalyticsListDto,
} from './dto/restaurant-analytics.dto';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  // ─── PLATFORM METRICS ───
  async getPlatformMetrics(): Promise<PlatformMetricsDto> {
    const cacheKey = 'analytics:platform-metrics';

    return this.cache.wrap(cacheKey, this.CACHE_TTL, async () => {
      const now = new Date();
      const todayStart = new Date(now);
      todayStart.setHours(0, 0, 0, 0);
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // Batch all aggregate queries in one Promise.all
      const [
        [totalUsersResult],
        [activeUsersResult],
        [totalRestaurantsResult],
        [totalDriversResult],
        [orderAgg],
        [todayAgg],
        [weekAgg],
        [monthAgg],
        [recentAgg],
        [previousAgg],
      ] = await Promise.all([
        this.db
          .select({ total: count() })
          .from(usersTable)
          .where(sql`${usersTable.deletedAt} IS NULL`),
        this.db
          .select({ total: count() })
          .from(usersTable)
          .where(
            and(
              sql`${usersTable.deletedAt} IS NULL`,
              sql`${usersTable.isOnline} = true`,
            ),
          ),
        this.db
          .select({ total: count() })
          .from(restaurantsTable)
          .where(sql`${restaurantsTable.deletedAt} IS NULL`),
        this.db
          .select({ total: count() })
          .from(usersTable)
          .where(
            and(
              eq(usersTable.role, 'DRIVER'),
              sql`${usersTable.deletedAt} IS NULL`,
            ),
          ),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${todayStart.toISOString()}::timestamp`,
          ),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${weekAgo.toISOString()}::timestamp`,
          ),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${monthAgo.toISOString()}::timestamp`,
          ),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`,
          ),
        this.db
          .select({ total: count(), revenue: sum(ordersTable.totalAmount) })
          .from(ordersTable)
          .where(
            and(
              sql`${ordersTable.createdAt} >= ${sixtyDaysAgo.toISOString()}::timestamp`,
              sql`${ordersTable.createdAt} < ${thirtyDaysAgo.toISOString()}::timestamp`,
            ),
          ),
      ]);

      // Daily trend (last 30 days) — single GROUP BY query
      const trendRows = await this.db
        .select({
          date: sql<string>`DATE(${ordersTable.createdAt})`.as('date'),
          orders: count(),
          revenue: sum(ordersTable.totalAmount),
        })
        .from(ordersTable)
        .where(
          sql`${ordersTable.createdAt} >= ${sixtyDaysAgo.toISOString()}::timestamp`,
        )
        .groupBy(sql`DATE(${ordersTable.createdAt})`);

      const trendMap = new Map(trendRows.map((r) => [String(r.date), r]));
      const trend: { date: string; orders: number; revenue: number }[] = [];
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const key = date.toISOString().split('T')[0];
        const row = trendMap.get(key);
        trend.push({
          date: key,
          orders: Number(row?.orders ?? 0),
          revenue: parseFloat(String(row?.revenue ?? '0')) || 0,
        });
      }

      const totalOrders = Number(orderAgg?.total ?? 0);
      const totalRevenue = parseFloat(String(orderAgg?.revenue ?? '0')) || 0;
      const todayOrders = Number(todayAgg?.total ?? 0);
      const todayRevenue = parseFloat(String(todayAgg?.revenue ?? '0')) || 0;
      const weekOrders = Number(weekAgg?.total ?? 0);
      const weekRevenue = parseFloat(String(weekAgg?.revenue ?? '0')) || 0;
      const monthOrders = Number(monthAgg?.total ?? 0);
      const monthRevenue = parseFloat(String(monthAgg?.revenue ?? '0')) || 0;
      const recentOrders = Number(recentAgg?.total ?? 0);
      const previousOrders = Number(previousAgg?.total ?? 0);
      const recentRevenue = parseFloat(String(recentAgg?.revenue ?? '0')) || 0;
      const previousRevenue =
        parseFloat(String(previousAgg?.revenue ?? '0')) || 0;

      const orderGrowth = previousOrders
        ? ((recentOrders - previousOrders) / previousOrders) * 100
        : 0;
      const revenueGrowth = previousRevenue
        ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
        : 0;

      return {
        totalUsers: totalUsersResult?.total || 0,
        totalRestaurants: totalRestaurantsResult?.total || 0,
        totalDrivers: totalDriversResult?.total || 0,
        totalOrders,
        totalRevenue,
        ordersToday: todayOrders,
        revenueToday: todayRevenue,
        ordersThisWeek: weekOrders,
        revenueThisWeek: weekRevenue,
        ordersThisMonth: monthOrders,
        revenueThisMonth: monthRevenue,
        orderTrend: trend,
        growth: {
          orders: orderGrowth,
          revenue: revenueGrowth,
          users: 0,
          restaurants: 0,
        },
      };
    });
  }

  // ─── RESTAURANT ANALYTICS ───
  async getRestaurantAnalytics(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'totalOrders',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<RestaurantAnalyticsListDto> {
    const cacheKey = `analytics:restaurants:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

    return this.cache.wrap(cacheKey, this.CACHE_TTL, async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const sixDaysAgo = new Date(now);
      sixDaysAgo.setDate(sixDaysAgo.getDate() - 6);
      sixDaysAgo.setHours(0, 0, 0, 0);

      // 1) All restaurants (single query)
      const restaurants = await this.db.query.restaurantsTable.findMany({
        where: sql`${restaurantsTable.deletedAt} IS NULL`,
      });

      // 2) Order aggregates per restaurant — ONE GROUP BY query
      const orderAggs = await this.db
        .select({
          restaurantId: ordersTable.restaurantId,
          total: count(),
          revenue: sum(ordersTable.totalAmount),
        })
        .from(ordersTable)
        .groupBy(ordersTable.restaurantId);

      // 3) Recent (30d) and previous (30-60d) period aggregates — two GROUP BY queries
      const [recentAggs, previousAggs, dailyAggs] = await Promise.all([
        this.db
          .select({
            restaurantId: ordersTable.restaurantId,
            total: count(),
            revenue: sum(ordersTable.totalAmount),
          })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`,
          )
          .groupBy(ordersTable.restaurantId),
        this.db
          .select({
            restaurantId: ordersTable.restaurantId,
            total: count(),
            revenue: sum(ordersTable.totalAmount),
          })
          .from(ordersTable)
          .where(
            and(
              sql`${ordersTable.createdAt} >= ${sixtyDaysAgo.toISOString()}::timestamp`,
              sql`${ordersTable.createdAt} < ${thirtyDaysAgo.toISOString()}::timestamp`,
            ),
          )
          .groupBy(ordersTable.restaurantId),
        // 4) Daily trend per restaurant (last 7 days) — single GROUP BY
        this.db
          .select({
            restaurantId: ordersTable.restaurantId,
            date: sql<string>`DATE(${ordersTable.createdAt})`.as('date'),
            orders: count(),
          })
          .from(ordersTable)
          .where(
            sql`${ordersTable.createdAt} >= ${sixDaysAgo.toISOString()}::timestamp`,
          )
          .groupBy(
            ordersTable.restaurantId,
            sql`DATE(${ordersTable.createdAt})`,
          ),
      ]);

      const orderMap = new Map(orderAggs.map((r) => [r.restaurantId, r]));
      const recentMap = new Map(recentAggs.map((r) => [r.restaurantId, r]));
      const previousMap = new Map(previousAggs.map((r) => [r.restaurantId, r]));
      const dailyMap = new Map<string, Map<string, number>>();
      for (const row of dailyAggs) {
        const rid = row.restaurantId;
        if (!dailyMap.has(rid)) dailyMap.set(rid, new Map());
        dailyMap.get(rid)!.set(String(row.date), Number(row.orders ?? 0));
      }

      const analytics: RestaurantAnalyticsDto[] = restaurants.map(
        (restaurant) => {
          const agg = orderMap.get(restaurant.id);
          const recent = recentMap.get(restaurant.id);
          const previous = previousMap.get(restaurant.id);
          const daily = dailyMap.get(restaurant.id);

          const recentCount = Number(recent?.total ?? 0);
          const previousCount = Number(previous?.total ?? 0);
          const growth = previousCount
            ? ((recentCount - previousCount) / previousCount) * 100
            : 0;

          // Build the last-7-day trend with zero-fill for missing days
          const dailyTrend: { date: string; orders: number }[] = [];
          for (let i = 6; i >= 0; i--) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            dailyTrend.push({
              date: key,
              orders: daily?.get(key) ?? 0,
            });
          }

          return {
            restaurantId: restaurant.id,
            name: restaurant.name,
            totalOrders: Number(agg?.total ?? 0),
            totalRevenue: parseFloat(String(agg?.revenue ?? '0')) || 0,
            averageRating: restaurant.averageRating
              ? parseFloat(restaurant.averageRating)
              : 0,
            totalReviews: restaurant.totalReviews || 0,
            growth,
            dailyTrend,
          };
        },
      );

      // Sort
      analytics.sort((a, b) => {
        const keys: Record<string, keyof RestaurantAnalyticsDto> = {
          totalOrders: 'totalOrders',
          totalRevenue: 'totalRevenue',
          averageRating: 'averageRating',
          growth: 'growth',
        };
        const k = keys[sortBy] ?? 'totalOrders';
        const av = a[k] as number;
        const bv = b[k] as number;
        return sortOrder === 'DESC' ? bv - av : av - bv;
      });

      const total = analytics.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;

      return {
        data: analytics.slice(start, start + limit),
        total,
        page,
        limit,
        totalPages,
      };
    });
  }

  // ─── DRIVER ANALYTICS ───
  async getDriverAnalytics(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'totalDeliveries',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<{
    data: DriverAnalyticsDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const cacheKey = `analytics:drivers:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;

    return this.cache.wrap(cacheKey, this.CACHE_TTL, async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      // All drivers (single query)
      const drivers = await this.db.query.usersTable.findMany({
        where: and(
          eq(usersTable.role, 'DRIVER'),
          sql`${usersTable.deletedAt} IS NULL`,
        ),
      });

      // One GROUP BY query computing deliveries, completed, cancelled and
      // on-time counts per driver using SQL FILTER (conditional aggregation).
      const [aggRows, recentRows, previousRows] = await Promise.all([
        this.db
          .select({
            driverId: ordersTable.driverId,
            total: sql<number>`count(*)`,
            completed: sql<number>`count(*) FILTER (WHERE ${ordersTable.orderStatus} = 'DELIVERED')`,
            cancelled: sql<number>`count(*) FILTER (WHERE ${ordersTable.orderStatus} = 'CANCELLED')`,
            onTime: sql<number>`count(*) FILTER (WHERE ${ordersTable.orderStatus} = 'DELIVERED' AND ${ordersTable.deliveredAt} IS NOT NULL AND ${ordersTable.estimatedDeliveryTime} IS NOT NULL AND ${ordersTable.deliveredAt} <= ${ordersTable.estimatedDeliveryTime})`,
            earnings: sum(ordersTable.deliveryFee),
          })
          .from(ordersTable)
          .where(sql`${ordersTable.driverId} IS NOT NULL`)
          .groupBy(ordersTable.driverId),
        this.db
          .select({
            driverId: ordersTable.driverId,
            earnings: sum(ordersTable.deliveryFee),
          })
          .from(ordersTable)
          .where(
            and(
              sql`${ordersTable.driverId} IS NOT NULL`,
              sql`${ordersTable.orderStatus} = 'DELIVERED'`,
              sql`${ordersTable.createdAt} >= ${thirtyDaysAgo.toISOString()}::timestamp`,
            ),
          )
          .groupBy(ordersTable.driverId),
        this.db
          .select({
            driverId: ordersTable.driverId,
            earnings: sum(ordersTable.deliveryFee),
          })
          .from(ordersTable)
          .where(
            and(
              sql`${ordersTable.driverId} IS NOT NULL`,
              sql`${ordersTable.orderStatus} = 'DELIVERED'`,
              sql`${ordersTable.createdAt} >= ${sixtyDaysAgo.toISOString()}::timestamp`,
              sql`${ordersTable.createdAt} < ${thirtyDaysAgo.toISOString()}::timestamp`,
            ),
          )
          .groupBy(ordersTable.driverId),
      ]);

      const aggMap = new Map(aggRows.map((r) => [r.driverId, r]));
      const recentMap = new Map(recentRows.map((r) => [r.driverId, r]));
      const previousMap = new Map(previousRows.map((r) => [r.driverId, r]));

      const analytics: DriverAnalyticsDto[] = drivers.map((driver) => {
        const agg = aggMap.get(driver.id) ?? {
          total: '0',
          completed: '0',
          cancelled: '0',
          onTime: '0',
          earnings: '0',
        };
        const totalDeliveries = Number(agg.total) || 0;
        const completedDeliveries = Number(agg.completed) || 0;
        const cancelledDeliveries = Number(agg.cancelled) || 0;
        const totalEarnings = parseFloat(String(agg.earnings)) || 0;
        const onTimeDeliveries = Number(agg.onTime) || 0;

        const acceptanceRate = totalDeliveries
          ? ((completedDeliveries + cancelledDeliveries) / totalDeliveries) *
            100
          : 0;
        const onTimeRate = completedDeliveries
          ? (onTimeDeliveries / completedDeliveries) * 100
          : 0;

        const recentEarnings =
          parseFloat(String(recentMap.get(driver.id)?.earnings ?? '0')) || 0;
        const previousEarnings =
          parseFloat(String(previousMap.get(driver.id)?.earnings ?? '0')) || 0;
        const growth = previousEarnings
          ? ((recentEarnings - previousEarnings) / previousEarnings) * 100
          : 0;

        return {
          driverId: driver.id,
          name: `${driver.firstName} ${driver.lastName}`,
          totalDeliveries,
          totalEarnings,
          averageRating: 4.5,
          completedDeliveries,
          cancelledDeliveries,
          acceptanceRate,
          onTimeRate,
          growth,
        };
      });

      // Sort
      analytics.sort((a, b) => {
        const keys: Record<string, keyof DriverAnalyticsDto> = {
          totalDeliveries: 'totalDeliveries',
          totalEarnings: 'totalEarnings',
          averageRating: 'averageRating',
          growth: 'growth',
          acceptanceRate: 'acceptanceRate',
        };
        const k = keys[sortBy] ?? 'totalDeliveries';
        const av = a[k] as number;
        const bv = b[k] as number;
        return sortOrder === 'DESC' ? bv - av : av - bv;
      });

      const total = analytics.length;
      const totalPages = Math.ceil(total / limit);
      const start = (page - 1) * limit;

      return {
        data: analytics.slice(start, start + limit),
        total,
        page,
        limit,
        totalPages,
      };
    });
  }
}
