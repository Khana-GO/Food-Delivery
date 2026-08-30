import {
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, desc, inArray } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { FavoriteResponseDto } from './dto/favorite-response.dto';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);
  private readonly CACHE_TTL = 300; // 5 minutes

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  private keyFavorites(userId: string) {
    return `favorites:user:${userId}`;
  }

  private keyFavorite(userId: string, restaurantId: string) {
    return `favorite:user:${userId}:restaurant:${restaurantId}`;
  }

  private async invalidateFavorites(userId: string) {
    await this.cache.del(this.keyFavorites(userId));
    await this.cache.delByPattern(`favorite:user:${userId}:*`);
  }

  // ─── ADD TO FAVORITES ───
  async addToFavorites(
    userId: string,
    dto: CreateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, dto.restaurantId),
    });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const existing = await this.db.query.favoriteRestaurantsTable.findFirst({
      where: and(
        eq(schema.favoriteRestaurantsTable.userId, userId),
        eq(schema.favoriteRestaurantsTable.restaurantId, dto.restaurantId),
      ),
    });
    if (existing) {
      throw new ConflictException('Restaurant already in favorites');
    }

    try {
      const [favorite] = await this.db
        .insert(schema.favoriteRestaurantsTable)
        .values({
          userId,
          restaurantId: dto.restaurantId,
        })
        .returning();

      await this.invalidateFavorites(userId);

      this.logger.log(
        `User ${userId} added restaurant ${dto.restaurantId} to favorites`,
      );

      return {
        id: favorite.id,
        restaurantId: favorite.restaurantId,
        userId: favorite.userId,
        createdAt: favorite.createdAt,
        restaurant: {
          id: restaurant.id,
          name: restaurant.name,
          slug: restaurant.slug,
          description: restaurant.description,
          logoUrl: restaurant.logoUrl,
          coverImageUrl: restaurant.coverImageUrl,
          cuisineType: restaurant.cuisineType,
          averageRating: restaurant.averageRating,
          totalReviews: restaurant.totalReviews,
          isOpen: restaurant.isOpen,
          isVerified: restaurant.isVerified,
          deliveryFee: restaurant.deliveryFee,
          estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
        } as any,
      };
    } catch (error) {
      this.logger.error(`Failed to add favorite: ${(error as Error).message}`);
      throw error;
    }
  }

  // Alias for scaffolds calling create()
  async create(userId: string, dto: CreateFavoriteDto) {
    return this.addToFavorites(userId, dto);
  }

  // ─── GET USER FAVORITES ─── (with join, no N+1)
  async getUserFavorites(userId: string): Promise<FavoriteResponseDto[]> {
    const cached = await this.cache.get<FavoriteResponseDto[]>(
      this.keyFavorites(userId),
    );
    if (cached) return cached;

    try {
      const favorites = await this.db
        .select()
        .from(schema.favoriteRestaurantsTable)
        .where(eq(schema.favoriteRestaurantsTable.userId, userId))
        .orderBy(desc(schema.favoriteRestaurantsTable.createdAt));

      if (favorites.length === 0) {
        await this.cache.set(this.keyFavorites(userId), [], this.CACHE_TTL);
        return [];
      }

      const restaurantIds = favorites.map((f) => f.restaurantId);
      // Fetch all restaurants in one query
      const restaurants = await this.db
        .select()
        .from(restaurantsTable)
        .where(inArray(restaurantsTable.id, restaurantIds));

      const restaurantMap = new Map(restaurants.map((r) => [r.id, r]));

      const result: FavoriteResponseDto[] = favorites
        .map((fav) => {
          const restaurant = restaurantMap.get(fav.restaurantId);
          if (!restaurant) return null;
          return {
            id: fav.id,
            restaurantId: fav.restaurantId,
            userId: fav.userId,
            createdAt: fav.createdAt,
            restaurant: {
              id: restaurant.id,
              name: restaurant.name,
              slug: restaurant.slug,
              description: restaurant.description,
              logoUrl: restaurant.logoUrl,
              coverImageUrl: restaurant.coverImageUrl,
              cuisineType: restaurant.cuisineType,
              averageRating: restaurant.averageRating,
              totalReviews: restaurant.totalReviews,
              isOpen: restaurant.isOpen,
              isVerified: restaurant.isVerified,
              deliveryFee: restaurant.deliveryFee,
              estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
            } as any,
          };
        })
        .filter(Boolean) as FavoriteResponseDto[];

      await this.cache.set(this.keyFavorites(userId), result, this.CACHE_TTL);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get favorites: ${(error as Error).message}`);
      throw error;
    }
  }

  async findAll(userId: string) {
    return this.getUserFavorites(userId);
  }

  // ─── FIND ONE (by favorite id, scoped to user) ───
  async findOne(userId: string, id: string): Promise<FavoriteResponseDto> {
    const fav = await this.db.query.favoriteRestaurantsTable.findFirst({
      where: and(
        eq(schema.favoriteRestaurantsTable.id, id),
        eq(schema.favoriteRestaurantsTable.userId, userId),
      ),
    });
    if (!fav) throw new NotFoundException('Favorite not found');

    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, fav.restaurantId),
    });

    return {
      id: fav.id,
      restaurantId: fav.restaurantId,
      userId: fav.userId,
      createdAt: fav.createdAt,
      restaurant: restaurant
        ? ({
            id: restaurant.id,
            name: restaurant.name,
            slug: restaurant.slug,
            description: restaurant.description,
            logoUrl: restaurant.logoUrl,
            coverImageUrl: restaurant.coverImageUrl,
            cuisineType: restaurant.cuisineType,
            averageRating: restaurant.averageRating,
            totalReviews: restaurant.totalReviews,
            isOpen: restaurant.isOpen,
            isVerified: restaurant.isVerified,
            deliveryFee: restaurant.deliveryFee,
            estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
          } as any)
        : undefined,
    };
  }

  // ─── UPDATE (change restaurantId) ───
  async update(
    userId: string,
    id: string,
    dto: UpdateFavoriteDto,
  ): Promise<FavoriteResponseDto> {
    if (!dto.restaurantId)
      throw new NotFoundException('No update data provided');
    const existing = await this.db.query.favoriteRestaurantsTable.findFirst({
      where: and(
        eq(schema.favoriteRestaurantsTable.id, id),
        eq(schema.favoriteRestaurantsTable.userId, userId),
      ),
    });
    if (!existing) throw new NotFoundException('Favorite not found');

    if (dto.restaurantId === existing.restaurantId) {
      return this.findOne(userId, id);
    }

    // Validate target restaurant exists
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, dto.restaurantId),
    });
    if (!restaurant) throw new NotFoundException('Target restaurant not found');

    // Check duplicate
    const dup = await this.db.query.favoriteRestaurantsTable.findFirst({
      where: and(
        eq(schema.favoriteRestaurantsTable.userId, userId),
        eq(schema.favoriteRestaurantsTable.restaurantId, dto.restaurantId),
      ),
    });
    if (dup) throw new ConflictException('Restaurant already in favorites');

    const [updated] = await this.db
      .update(schema.favoriteRestaurantsTable)
      .set({ restaurantId: dto.restaurantId })
      .where(eq(schema.favoriteRestaurantsTable.id, id))
      .returning();

    await this.invalidateFavorites(userId);
    return {
      id: updated.id,
      restaurantId: updated.restaurantId,
      userId: updated.userId,
      createdAt: updated.createdAt,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
        slug: restaurant.slug,
        description: restaurant.description,
        logoUrl: restaurant.logoUrl,
        coverImageUrl: restaurant.coverImageUrl,
        cuisineType: restaurant.cuisineType,
        averageRating: restaurant.averageRating,
        totalReviews: restaurant.totalReviews,
        isOpen: restaurant.isOpen,
        isVerified: restaurant.isVerified,
        deliveryFee: restaurant.deliveryFee,
        estimatedDeliveryTime: restaurant.estimatedDeliveryTime,
      } as any,
    };
  }

  // ─── CHECK IF FAVORITE ───
  async isFavorite(userId: string, restaurantId: string): Promise<boolean> {
    const cacheKey = this.keyFavorite(userId, restaurantId);
    const cached = await this.cache.get<boolean>(cacheKey);
    if (cached !== null) return cached;

    try {
      const favorite = await this.db.query.favoriteRestaurantsTable.findFirst({
        where: and(
          eq(schema.favoriteRestaurantsTable.userId, userId),
          eq(schema.favoriteRestaurantsTable.restaurantId, restaurantId),
        ),
      });
      const result = !!favorite;
      await this.cache.set(cacheKey, result, 60);
      return result;
    } catch (error) {
      this.logger.error(
        `Failed to check favorite: ${(error as Error).message}`,
      );
      return false;
    }
  }

  // ─── REMOVE FROM FAVORITES (by restaurantId) ───
  async removeFromFavorites(
    userId: string,
    restaurantId: string,
  ): Promise<{ message: string }> {
    const result = await this.db
      .delete(schema.favoriteRestaurantsTable)
      .where(
        and(
          eq(schema.favoriteRestaurantsTable.userId, userId),
          eq(schema.favoriteRestaurantsTable.restaurantId, restaurantId),
        ),
      )
      .returning();

    if (result.length === 0) {
      throw new NotFoundException('Favorite not found');
    }

    await this.invalidateFavorites(userId);
    this.logger.log(
      `User ${userId} removed restaurant ${restaurantId} from favorites`,
    );
    return { message: 'Removed from favorites' };
  }

  // Alias for scaffolds: remove by favorite id
  async remove(userId: string, id: string): Promise<{ message: string }> {
    const fav = await this.db.query.favoriteRestaurantsTable.findFirst({
      where: and(
        eq(schema.favoriteRestaurantsTable.id, id),
        eq(schema.favoriteRestaurantsTable.userId, userId),
      ),
    });
    if (!fav) throw new NotFoundException('Favorite not found');
    return this.removeFromFavorites(userId, fav.restaurantId);
  }
}
