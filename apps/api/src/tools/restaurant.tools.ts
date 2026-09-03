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
      func: async (query: string) => {
        try {
          const result = await this.restaurantsService.findAll({
            search: query,
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
        'Get detailed information about a specific restaurant by ID. Input is UUID of restaurant.',
      func: async (input: string) => {
        try {
          const restaurantId = this.extractId(input);
          const restaurant =
            await this.restaurantsService.findById(restaurantId);
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
            error: 'Restaurant not found. Please check the ID.',
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
        'Check if a restaurant is currently open and accepting orders. Input is restaurant UUID.',
      func: async (input: string) => {
        try {
          const restaurantId = this.extractId(input);
          const restaurant =
            await this.restaurantsService.findById(restaurantId);
          return JSON.stringify({
            isOpen: restaurant.isOpen,
            isActive: restaurant.isActive,
            message: restaurant.isOpen
              ? 'Restaurant is currently open and accepting orders'
              : 'Restaurant is currently closed',
          });
        } catch (error) {
          return JSON.stringify({ error: 'Restaurant not found' });
        }
      },
    });
  }

  private extractId(input: string): string {
    if (!input) return '';
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const match = input.match(uuidRegex);
    if (match) return match[0];
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed?.restaurantId) return parsed.restaurantId;
      if (parsed?.id) return parsed.id;
    } catch {
      /* empty */
    }
    return input
      .trim()
      .replace(/^["']|["']$/g, '')
      .split(/\s+/)[0];
  }
}
