import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../db/database.constants';
import * as schema from '../db/schema';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, sql } from 'drizzle-orm';

@Injectable()
export class HomeService {
  constructor(
    @Inject(DATABASE)
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async getHomeData(latitude: number | null, longitude: number | null) {
    // 1. Fetch Location
    // Since we are reverse geocoding on the client side, we just return a status for now.
    const location = {
      latitude,
      longitude,
    };

    // 2. Fetch Banners/Promotions
    const banners = await this.db.query.promotionsTable.findMany({
      where: eq(schema.promotionsTable.isActive, true),
      orderBy: [desc(schema.promotionsTable.createdAt)],
      limit: 5,
    });

    // 3. Fetch Categories
    const categories = await this.db.query.menuCategoriesTable.findMany({
      limit: 10,
    });

    // Haversine formula for distance calculation in miles
    // Using 3959 for miles, 6371 for kilometers
    const distanceQuery = (lat: number, lng: number) => {
      return sql<number>`(
        3959 * acos(
          cos(radians(${lat})) * cos(radians(${schema.restaurantsTable.latitude})) *
          cos(radians(${schema.restaurantsTable.longitude}) - radians(${lng})) +
          sin(radians(${lat})) * sin(radians(${schema.restaurantsTable.latitude}))
        )
      )`;
    };

    // 4. Fetch Nearby Restaurants
    const nearbyRestaurants = latitude !== null && longitude !== null
      ? await this.db
          .select({
            restaurant: schema.restaurantsTable,
            distance: distanceQuery(latitude, longitude),
          })
          .from(schema.restaurantsTable)
          .where(eq(schema.restaurantsTable.isActive, true))
          .orderBy(distanceQuery(latitude, longitude))
          .limit(10)
      : await this.db
          .select({
            restaurant: schema.restaurantsTable,
            distance: sql<number>`0`,
          })
          .from(schema.restaurantsTable)
          .where(eq(schema.restaurantsTable.isActive, true))
          .orderBy(desc(schema.restaurantsTable.averageRating))
          .limit(10);

    // 5. Top Rated Restaurants
    const topRatedRestaurants = await this.db.query.restaurantsTable.findMany({
      where: eq(schema.restaurantsTable.isActive, true),
      orderBy: [desc(schema.restaurantsTable.averageRating)],
      limit: 10,
    });

    // 6. Recommended Foods (Just picking some random available items for now, could be enhanced with ML/Rating)
    const recommendedFoods = await this.db.query.menuItemsTable.findMany({
      where: eq(schema.menuItemsTable.isAvailable, true),
      limit: 10,
    });

    // 7. Popular Near You (Similar to top rated but different criteria, mock for now)
    const popularFoods = await this.db.query.menuItemsTable.findMany({
      where: eq(schema.menuItemsTable.isAvailable, true),
      limit: 8,
    });

    // 8. Featured Restaurants
    const featuredRestaurants = topRatedRestaurants.slice(0, 5); // using top rated as featured for mock

    // 9. Best Deals (Mocking deals logic based on banners or a specific flag in future)
    const deals = [];

    // 10. Recent Orders (Requires user auth context, so we'll leave empty for public home data)
    const recentOrders = [];

    return {
      location,
      banners,
      categories,
      recommendedFoods,
      nearbyRestaurants,
      popularFoods,
      deals,
      recentOrders,
      topRatedRestaurants,
      featuredRestaurants,
    };
  }
}
