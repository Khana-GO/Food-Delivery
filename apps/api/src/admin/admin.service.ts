import { Injectable, Inject } from '@nestjs/common';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { sql, eq } from 'drizzle-orm';

@Injectable()
export class AdminService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  async getDashboardMetrics() {
    const totalOrdersRes = await this.db.select({ count: sql<number>`count(*)` }).from(schema.ordersTable);
    const activeRestaurantsRes = await this.db.select({ count: sql<number>`count(*)` }).from(schema.restaurantsTable);
    
    // In PostgreSQL, COUNT returns a string (bigint), so we might need to parse it or just return it.
    
    return {
      totalOrders: Number(totalOrdersRes[0].count),
      activeRestaurants: Number(activeRestaurantsRes[0].count),
      totalDrivers: 0, // Placeholder
      revenueToday: 0, // Placeholder
      recentIssues: [], // Placeholder
    };
  }
}
