import { Injectable, Logger } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { eq, sql, and, count } from 'drizzle-orm';
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
    const cached = await this.cache.get<PlatformMetricsDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Count users by role
    const [totalUsersResult] = await this.db
      .select({ total: count() })
      .from(usersTable)
      .where(sql`${usersTable.deletedAt} IS NULL`);

    const [activeUsersResult] = await this.db
      .select({ total: count() })
      .from(usersTable)
      .where(
        and(
          sql`${usersTable.deletedAt} IS NULL`,
          sql`${usersTable.isOnline} = true`,
        ),
      );

    const [totalRestaurantsResult] = await this.db
      .select({ total: count() })
      .from(restaurantsTable)
      .where(sql`${restaurantsTable.deletedAt} IS NULL`);

    const [totalDriversResult] = await this.db
      .select({ total: count() })
      .from(usersTable)
      .where(
        and(
          eq(usersTable.role, 'DRIVER'),
          sql`${usersTable.deletedAt} IS NULL`,
        ),
      );

    // Orders and revenue
    const allOrders = await this.db.select().from(ordersTable);

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount),
      0,
    );

    // Today's stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= today);
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

    // Daily trend (last 30 days)
    const trend: { date: string; orders: number; revenue: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      const dayOrders = allOrders.filter(
        (o) =>
          new Date(o.createdAt) >= date && new Date(o.createdAt) < nextDate,
      );
      trend.push({
        date: date.toISOString().split('T')[0],
        orders: dayOrders.length,
        revenue: dayOrders.reduce(
          (sum, o) => sum + parseFloat(o.totalAmount),
          0,
        ),
      });
    }

    // Growth calculations (compare last 30 days with previous 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
    const recentOrders = allOrders.filter(
      (o) => new Date(o.createdAt) >= thirtyDaysAgo,
    );
    const previousOrders = allOrders.filter(
      (o) =>
        new Date(o.createdAt) >= sixtyDaysAgo &&
        new Date(o.createdAt) < thirtyDaysAgo,
    );
    const recentRevenue = recentOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount),
      0,
    );
    const previousRevenue = previousOrders.reduce(
      (sum, o) => sum + parseFloat(o.totalAmount),
      0,
    );
    const orderGrowth = previousOrders.length
      ? ((recentOrders.length - previousOrders.length) /
          previousOrders.length) *
        100
      : 0;
    const revenueGrowth = previousRevenue
      ? ((recentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const result: PlatformMetricsDto = {
      totalUsers: totalUsersResult?.total || 0,
      totalRestaurants: totalRestaurantsResult?.total || 0,
      totalDrivers: totalDriversResult?.total || 0,
      totalOrders,
      totalRevenue,
      ordersToday: todayOrders.length,
      revenueToday: todayRevenue,
      ordersThisWeek: weekOrders.length,
      revenueThisWeek: weekRevenue,
      ordersThisMonth: monthOrders.length,
      revenueThisMonth: monthRevenue,
      orderTrend: trend,
      growth: {
        orders: orderGrowth,
        revenue: revenueGrowth,
        users: 0,
        restaurants: 0,
      },
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }

  // ─── RESTAURANT ANALYTICS ───
  async getRestaurantAnalytics(
    page: number = 1,
    limit: number = 10,
    sortBy: string = 'totalOrders',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
  ): Promise<RestaurantAnalyticsListDto> {
    const cacheKey = `analytics:restaurants:page:${page}:limit:${limit}:sort:${sortBy}:${sortOrder}`;
    const cached = await this.cache.get<RestaurantAnalyticsListDto>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all restaurants with order counts and revenue
    const restaurants = await this.db.query.restaurantsTable.findMany({
      where: sql`${restaurantsTable.deletedAt} IS NULL`,
    });

    const analytics: RestaurantAnalyticsDto[] = [];

    for (const restaurant of restaurants) {
      const orders = await this.db
        .select()
        .from(ordersTable)
        .where(and(eq(ordersTable.restaurantId, restaurant.id)));

      const totalOrders = orders.length;
      const totalRevenue = orders.reduce(
        (sum, o) => sum + parseFloat(o.totalAmount),
        0,
      );
      const averageRating = restaurant.averageRating
        ? parseFloat(restaurant.averageRating)
        : 0;
      const totalReviews = restaurant.totalReviews || 0;

      // Daily trend for this restaurant (last 7 days)
      const dailyTrend: { date: string; orders: number }[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        const dayOrders = orders.filter(
          (o) =>
            new Date(o.createdAt) >= date && new Date(o.createdAt) < nextDate,
        );
        dailyTrend.push({
          date: date.toISOString().split('T')[0],
          orders: dayOrders.length,
        });
      }

      // Growth (compare last 30 days with previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const recentOrders = orders.filter(
        (o) => new Date(o.createdAt) >= thirtyDaysAgo,
      );
      const previousOrders = orders.filter(
        (o) =>
          new Date(o.createdAt) >= sixtyDaysAgo &&
          new Date(o.createdAt) < thirtyDaysAgo,
      );
      const growth = previousOrders.length
        ? ((recentOrders.length - previousOrders.length) /
            previousOrders.length) *
          100
        : 0;

      analytics.push({
        restaurantId: restaurant.id,
        name: restaurant.name,
        totalOrders,
        totalRevenue,
        averageRating,
        totalReviews,
        growth,
        dailyTrend,
      });
    }

    // Sort
    analytics.sort((a, b) => {
      if (sortBy === 'totalOrders') {
        return sortOrder === 'DESC'
          ? b.totalOrders - a.totalOrders
          : a.totalOrders - b.totalOrders;
      } else if (sortBy === 'totalRevenue') {
        return sortOrder === 'DESC'
          ? b.totalRevenue - a.totalRevenue
          : a.totalRevenue - b.totalRevenue;
      } else if (sortBy === 'averageRating') {
        return sortOrder === 'DESC'
          ? b.averageRating - a.averageRating
          : a.averageRating - b.averageRating;
      } else if (sortBy === 'growth') {
        return sortOrder === 'DESC' ? b.growth - a.growth : a.growth - b.growth;
      }
      return sortOrder === 'DESC'
        ? b.totalOrders - a.totalOrders
        : a.totalOrders - b.totalOrders;
    });

    const total = analytics.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = analytics.slice(start, start + limit);

    const result: RestaurantAnalyticsListDto = {
      data,
      total,
      page,
      limit,
      totalPages,
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
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
    const cached = await this.cache.get<{
      data: DriverAnalyticsDto[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Get all drivers
    const drivers = await this.db.query.usersTable.findMany({
      where: and(
        eq(usersTable.role, 'DRIVER'),
        sql`${usersTable.deletedAt} IS NULL`,
      ),
    });

    const analytics: DriverAnalyticsDto[] = [];

    for (const driver of drivers) {
      const deliveries = await this.db
        .select()
        .from(ordersTable)
        .where(and(eq(ordersTable.driverId, driver.id)));

      const completed = deliveries.filter((o) => o.orderStatus === 'DELIVERED');
      const cancelled = deliveries.filter((o) => o.orderStatus === 'CANCELLED');
      const totalDeliveries = deliveries.length;
      const totalEarnings = completed.reduce(
        (sum, o) => sum + parseFloat(o.deliveryFee || '0'),
        0,
      );
      const acceptanceRate = deliveries.length
        ? ((completed.length + cancelled.length) / deliveries.length) * 100
        : 0;
      const onTimeRate = completed.length
        ? (completed.filter(
            (o) =>
              o.estimatedDeliveryTime &&
              o.deliveredAt &&
              new Date(o.deliveredAt) <= new Date(o.estimatedDeliveryTime),
          ).length /
            completed.length) *
          100
        : 0;

      // Growth in earnings (compare last 30 days with previous 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const recentEarnings = completed
        .filter((o) => new Date(o.createdAt) >= thirtyDaysAgo)
        .reduce((sum, o) => sum + parseFloat(o.deliveryFee || '0'), 0);
      const previousEarnings = completed
        .filter(
          (o) =>
            new Date(o.createdAt) >= sixtyDaysAgo &&
            new Date(o.createdAt) < thirtyDaysAgo,
        )
        .reduce((sum, o) => sum + parseFloat(o.deliveryFee || '0'), 0);
      const growth = previousEarnings
        ? ((recentEarnings - previousEarnings) / previousEarnings) * 100
        : 0;

      const avgRating = 4.5;

      analytics.push({
        driverId: driver.id,
        name: `${driver.firstName} ${driver.lastName}`,
        totalDeliveries,
        totalEarnings,
        averageRating: avgRating,
        completedDeliveries: completed.length,
        cancelledDeliveries: cancelled.length,
        acceptanceRate,
        onTimeRate,
        growth,
      });
    }

    // Sort
    analytics.sort((a, b) => {
      if (sortBy === 'totalDeliveries') {
        return sortOrder === 'DESC'
          ? b.totalDeliveries - a.totalDeliveries
          : a.totalDeliveries - b.totalDeliveries;
      } else if (sortBy === 'totalEarnings') {
        return sortOrder === 'DESC'
          ? b.totalEarnings - a.totalEarnings
          : a.totalEarnings - b.totalEarnings;
      } else if (sortBy === 'averageRating') {
        return sortOrder === 'DESC'
          ? b.averageRating - a.averageRating
          : a.averageRating - b.averageRating;
      } else if (sortBy === 'growth') {
        return sortOrder === 'DESC' ? b.growth - a.growth : a.growth - b.growth;
      } else if (sortBy === 'acceptanceRate') {
        return sortOrder === 'DESC'
          ? b.acceptanceRate - a.acceptanceRate
          : a.acceptanceRate - b.acceptanceRate;
      }
      return sortOrder === 'DESC'
        ? b.totalDeliveries - a.totalDeliveries
        : a.totalDeliveries - b.totalDeliveries;
    });

    const total = analytics.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const data = analytics.slice(start, start + limit);

    const result = {
      data,
      total,
      page,
      limit,
      totalPages,
    };

    await this.cache.set(cacheKey, result, this.CACHE_TTL);
    return result;
  }
}
