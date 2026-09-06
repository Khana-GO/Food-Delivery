import { DynamicTool } from '@langchain/core/tools';
import { Injectable } from '@nestjs/common';
import { RestaurantsService } from '../restaurant/restaurant.service';

@Injectable()
export class RestaurantTools {
  constructor(private readonly restaurantsService: RestaurantsService) {}

  // ─── SEARCH RESTAURANTS ───
  getSearchRestaurantsTool() {
    return new DynamicTool({
      name: 'search_restaurants',
      description:
        'Search for restaurants by cuisine, name, or location. Returns a list of restaurants with their details.',
      func: async (input: string) => {
        try {
          const query = this.extractQuery(input);
          const result = await this.restaurantsService.findAll({
            search: query || undefined,
            limit: 10,
          });
          return JSON.stringify({
            count: result.data.length,
            restaurants: result.data.map((r) => ({
              id: r.id,
              name: r.name,
              cuisineType: r.cuisineType,
              rating: r.averageRating,
              isOpen: r.isOpen,
              deliveryFee: r.deliveryFee,
              estimatedDeliveryTime: r.estimatedDeliveryTime,
              address: r.address,
            })),
          });
        } catch (error) {
          return JSON.stringify({ error: 'Failed to search restaurants' });
        }
      },
    });
  }

  // ─── GET RESTAURANT DETAILS ───
  getRestaurantDetailsTool() {
    return new DynamicTool({
      name: 'get_restaurant_details',
      description:
        'Get detailed information about a specific restaurant by ID or name. Input is restaurant UUID or restaurant name.',
      func: async (input: string) => {
        try {
          const restaurant = await this.resolveRestaurant(input);
          if (!restaurant) {
            return JSON.stringify({
              error: 'Restaurant not found. Please check the name or ID.',
            });
          }
          return JSON.stringify({
            id: restaurant.id,
            name: restaurant.name,
            description: restaurant.description,
            cuisineType: restaurant.cuisineType,
            address: restaurant.address,
            isOpen: restaurant.isOpen,
            rating: restaurant.averageRating,
            deliveryFee: restaurant.deliveryFee,
            minimumOrderAmount: restaurant.minimumOrderAmount,
            estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
            phone: restaurant.phone,
            email: restaurant.email,
          });
        } catch (error) {
          return JSON.stringify({
            error: 'Restaurant not found. Please check the ID or name.',
          });
        }
      },
    });
  }

  // ─── GET POPULAR RESTAURANTS ───
  getPopularRestaurantsTool() {
    return new DynamicTool({
      name: 'get_popular_restaurants',
      description:
        'Get a list of popular restaurants based on ratings and orders.',
      func: async () => {
        try {
          const restaurants = await this.restaurantsService.findAll({
            limit: 10,
          });
          const sorted = restaurants.data.sort(
            (a, b) => Number(b.averageRating) - Number(a.averageRating),
          );
          return JSON.stringify({
            restaurants: sorted.map((r) => ({
              id: r.id,
              name: r.name,
              cuisineType: r.cuisineType,
              rating: r.averageRating,
              isOpen: r.isOpen,
              deliveryFee: r.deliveryFee,
              estimatedDeliveryTime: r.estimatedDeliveryTime,
            })),
          });
        } catch (error) {
          return JSON.stringify({ error: 'Failed to get popular restaurants' });
        }
      },
    });
  }

  // ─── CHECK RESTAURANT AVAILABILITY ───
  getRestaurantAvailabilityTool() {
    return new DynamicTool({
      name: 'check_restaurant_availability',
      description:
        'Check if a restaurant is currently open and accepting orders. Input is restaurant UUID or name.',
      func: async (input: string) => {
        try {
          const restaurant = await this.resolveRestaurant(input);
          if (!restaurant) {
            return JSON.stringify({ error: 'Restaurant not found' });
          }
          return JSON.stringify({
            id: restaurant.id,
            name: restaurant.name,
            isOpen: restaurant.isOpen,
            isActive: restaurant.isActive,
            message: restaurant.isOpen
              ? `${restaurant.name} is currently open and accepting orders`
              : `${restaurant.name} is currently closed`,
          });
        } catch (error) {
          return JSON.stringify({ error: 'Restaurant not found' });
        }
      },
    });
  }

  private extractQuery(input: string): string {
    if (!input) return '';
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed?.query) return String(parsed.query).trim();
      if (parsed?.search) return String(parsed.search).trim();
      if (parsed?.cuisine) return String(parsed.cuisine).trim();
      if (parsed?.name) return String(parsed.name).trim();
    } catch {
      /* empty */
    }
    return input.trim().replace(/^["']|["']$/g, '');
  }

  private async resolveRestaurant(input: string): Promise<any> {
    if (!input) return null;
    const clean = this.extractQuery(input)
      .replace(/[?!.,;:]/g, '')
      .trim();
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const match = clean.match(uuidRegex);
    if (match) {
      try {
        return await this.restaurantsService.findById(match[0]);
      } catch {
        return null;
      }
    }

    // Try name lookup
    try {
      const results = await this.restaurantsService.findAll({
        search: clean,
        limit: 5,
      });
      if (results.data.length > 0) {
        // Find exact or closest match
        const exact = results.data.find(
          (r) => r.name.toLowerCase() === clean.toLowerCase(),
        );
        return exact || results.data[0];
      }
    } catch {
      /* empty */
    }

    return null;
  }
}
