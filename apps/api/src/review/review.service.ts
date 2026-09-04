import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, desc, count, sql, avg } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { usersTable } from '../db/schema/user.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { menuItemsTable } from '../db/schema/menu.items.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { ReviewStatsDto } from './dto/review-stats.dto';
import { ReviewPaginationDto } from './dto/review-pagination.dto';
import * as schema from '../db/schema';

@Injectable()
export class ReviewsService {
  private readonly logger = new Logger(ReviewsService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`[${context}] Error:`, error);
      throw error;
    }
  }

  // ─── CREATE REVIEW ───
  async create(
    customerId: string,
    dto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.handleDbOperation(async () => {
      // Check if user already reviewed this restaurant
      const existing = await this.db.query.reviewsTable.findFirst({
        where: and(
          eq(schema.reviewsTable.customerId, customerId),
          eq(schema.reviewsTable.restaurantId, dto.restaurantId),
        ),
      });

      if (existing) {
        throw new BadRequestException(
          'You have already reviewed this restaurant',
        );
      }

      // Verify restaurant exists
      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, dto.restaurantId),
      });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      // Verify menu item if provided
      let itemName: string | undefined;
      if (dto.itemId) {
        const item = await this.db.query.menuItemsTable.findFirst({
          where: eq(menuItemsTable.id, dto.itemId),
        });
        if (!item) {
          throw new NotFoundException('Menu item not found');
        }
        itemName = item.name;
      }

      const [review] = await this.db
        .insert(schema.reviewsTable)
        .values({
          customerId,
          restaurantId: dto.restaurantId,
          itemId: dto.itemId,
          rating: dto.rating,
          comment: dto.comment,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      // Update restaurant average rating
      await this.updateRestaurantRating(dto.restaurantId);

      const customer = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, customerId),
      });

      return {
        id: review.id,
        customerId: review.customerId,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : 'Anonymous',
        restaurantId: review.restaurantId,
        restaurantName: restaurant.name,
        itemId: review.itemId || undefined,
        itemName,
        rating: review.rating,
        comment: review.comment || undefined,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
      };
    }, 'create');
  }

  // ─── GET REVIEWS FOR RESTAURANT ───
  async getReviewsForRestaurant(
    restaurantId: string,
    pagination: ReviewPaginationDto,
  ): Promise<{
    data: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { page = 1, limit = 10, sortOrder = 'DESC' } = pagination;

    const conditions = [eq(schema.reviewsTable.restaurantId, restaurantId)];

    const [countResult] = await this.db
      .select({ total: count() })
      .from(schema.reviewsTable)
      .where(and(...conditions));

    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const reviews = await this.db
      .select()
      .from(schema.reviewsTable)
      .where(and(...conditions))
      .orderBy(desc(schema.reviewsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const customer = await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, review.customerId),
        });
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: eq(restaurantsTable.id, review.restaurantId),
        });
        let itemName: string | undefined;
        if (review.itemId) {
          const item = await this.db.query.menuItemsTable.findFirst({
            where: eq(menuItemsTable.id, review.itemId),
          });
          itemName = item?.name;
        }
        return {
          id: review.id,
          customerId: review.customerId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'Anonymous',
          restaurantId: review.restaurantId,
          restaurantName: restaurant?.name || 'Unknown',
          itemId: review.itemId || undefined,
          itemName,
          rating: review.rating,
          comment: review.comment || undefined,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      }),
    );

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // ─── GET MY REVIEWS (CUSTOMER) ───
  async getMyReviews(customerId: string): Promise<{
    data: ReviewResponseDto[];
    averageRating: number;
    totalReviews: number;
  }> {
    return this.handleDbOperation(async () => {
      const reviews = await this.db
        .select()
        .from(schema.reviewsTable)
        .where(eq(schema.reviewsTable.customerId, customerId))
        .orderBy(desc(schema.reviewsTable.createdAt));

      const customer = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, customerId),
      });
      const customerName = customer
        ? `${customer.firstName} ${customer.lastName}`
        : 'You';

      const enriched = await Promise.all(
        reviews.map(async (review) => {
          const restaurant = await this.db.query.restaurantsTable.findFirst({
            where: eq(restaurantsTable.id, review.restaurantId),
          });
          let itemName: string | undefined;
          if (review.itemId) {
            const item = await this.db.query.menuItemsTable.findFirst({
              where: eq(menuItemsTable.id, review.itemId),
            });
            itemName = item?.name;
          }
          return {
            id: review.id,
            customerId: review.customerId,
            customerName,
            restaurantId: review.restaurantId,
            restaurantName: restaurant?.name || 'Unknown',
            itemId: review.itemId || undefined,
            itemName,
            rating: review.rating,
            comment: review.comment || undefined,
            createdAt: review.createdAt,
            updatedAt: review.updatedAt,
          } as ReviewResponseDto;
        }),
      );

      const total = reviews.length;
      const averageRating =
        total > 0
          ? parseFloat(
              (
                reviews.reduce((sum, r) => sum + r.rating, 0) / total
              ).toFixed(1),
            )
          : 0;

      return { data: enriched, averageRating, totalReviews: total };
    }, 'getMyReviews');
  }

  // ─── GET REVIEW STATS ───
  async getReviewStats(restaurantId: string): Promise<ReviewStatsDto> {
    const reviews = await this.db
      .select()
      .from(schema.reviewsTable)
      .where(eq(schema.reviewsTable.restaurantId, restaurantId))
      .orderBy(desc(schema.reviewsTable.createdAt));

    const total = reviews.length;
    const avgRating =
      total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach((r) => {
      if (r.rating >= 1 && r.rating <= 5) {
        distribution[r.rating as keyof typeof distribution] += 1;
      }
    });

    // Get 3 most recent reviews
    const recent = reviews.slice(0, 3);
    const recentEnriched = await Promise.all(
      recent.map(async (review) => {
        const customer = await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, review.customerId),
        });
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: eq(restaurantsTable.id, review.restaurantId),
        });
        let itemName: string | undefined;
        if (review.itemId) {
          const item = await this.db.query.menuItemsTable.findFirst({
            where: eq(menuItemsTable.id, review.itemId),
          });
          itemName = item?.name;
        }
        return {
          id: review.id,
          customerId: review.customerId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'Anonymous',
          restaurantId: review.restaurantId,
          restaurantName: restaurant?.name || 'Unknown',
          itemId: review.itemId || undefined,
          itemName,
          rating: review.rating,
          comment: review.comment || undefined,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      }),
    );

    return {
      averageRating: parseFloat(avgRating.toFixed(1)),
      totalReviews: total,
      ratingDistribution: distribution,
      recentReviews: recentEnriched,
    };
  }

  // ─── UPDATE REVIEW ───
  async updateReview(
    reviewId: string,
    customerId: string,
    dto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return this.handleDbOperation(async () => {
      const existing = await this.db.query.reviewsTable.findFirst({
        where: and(
          eq(schema.reviewsTable.id, reviewId),
          eq(schema.reviewsTable.customerId, customerId),
        ),
      });
      if (!existing) {
        throw new NotFoundException('Review not found or you do not own it');
      }

      const updateData: Partial<typeof schema.reviewsTable.$inferInsert> = {
        ...dto,
        updatedAt: new Date(),
      };

      const [updated] = await this.db
        .update(schema.reviewsTable)
        .set(updateData)
        .where(eq(schema.reviewsTable.id, reviewId))
        .returning();

      await this.updateRestaurantRating(updated.restaurantId);

      const restaurant = await this.db.query.restaurantsTable.findFirst({
        where: eq(restaurantsTable.id, updated.restaurantId),
      });
      const customer = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, updated.customerId),
      });

      return {
        id: updated.id,
        customerId: updated.customerId,
        customerName: customer
          ? `${customer.firstName} ${customer.lastName}`
          : 'Anonymous',
        restaurantId: updated.restaurantId,
        restaurantName: restaurant?.name || 'Unknown',
        rating: updated.rating,
        comment: updated.comment || undefined,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
    }, 'updateReview');
  }

  // ─── DELETE REVIEW ───
  async deleteReview(
    reviewId: string,
    userId: string,
    role: string,
  ): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const review = await this.db.query.reviewsTable.findFirst({
        where: eq(schema.reviewsTable.id, reviewId),
      });
      if (!review) {
        throw new NotFoundException('Review not found');
      }

      // Check permissions: customer can delete own, admin can delete any, owner can delete reviews on their restaurant
      if (role === 'CUSTOMER' && review.customerId !== userId) {
        throw new ForbiddenException('You can only delete your own reviews');
      }
      if (role === 'RESTAURANT_OWNER') {
        const restaurants = await this.db.query.restaurantsTable.findMany({
          where: eq(restaurantsTable.ownerId, userId),
          columns: { id: true },
        });
        if (!restaurants.some((r) => r.id === review.restaurantId)) {
          throw new ForbiddenException(
            'You can only delete reviews on your restaurant',
          );
        }
      }
      if (role === 'ADMIN') {
        // Admin can delete any
      } else if (!['CUSTOMER', 'RESTAURANT_OWNER', 'ADMIN'].includes(role)) {
        throw new ForbiddenException('Insufficient permissions');
      }

      await this.db
        .delete(schema.reviewsTable)
        .where(eq(schema.reviewsTable.id, reviewId));

      await this.updateRestaurantRating(review.restaurantId);

      return { message: 'Review deleted successfully' };
    }, 'deleteReview');
  }

  // ─── ADMIN: GET ALL REVIEWS ───
  async adminGetAllReviews(pagination: ReviewPaginationDto) {
    const { page = 1, limit = 10, sortOrder = 'DESC' } = pagination;
    const [countResult] = await this.db
      .select({ total: count() })
      .from(schema.reviewsTable);
    const total = countResult?.total || 0;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;

    const reviews = await this.db
      .select()
      .from(schema.reviewsTable)
      .orderBy(desc(schema.reviewsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const enriched = await Promise.all(
      reviews.map(async (review) => {
        const customer = await this.db.query.usersTable.findFirst({
          where: eq(usersTable.id, review.customerId),
        });
        const restaurant = await this.db.query.restaurantsTable.findFirst({
          where: eq(restaurantsTable.id, review.restaurantId),
        });
        return {
          id: review.id,
          customerId: review.customerId,
          customerName: customer
            ? `${customer.firstName} ${customer.lastName}`
            : 'Anonymous',
          restaurantId: review.restaurantId,
          restaurantName: restaurant?.name || 'Unknown',
          rating: review.rating,
          comment: review.comment || undefined,
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
        };
      }),
    );

    return {
      data: enriched,
      total,
      page,
      limit,
      totalPages,
    };
  }

  // ─── HELPERS ───
  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    const reviews = await this.db
      .select()
      .from(schema.reviewsTable)
      .where(eq(schema.reviewsTable.restaurantId, restaurantId));

    const total = reviews.length;
    const avg =
      total > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / total : 0;

    await this.db
      .update(restaurantsTable)
      .set({
        averageRating: avg.toString(),
        totalReviews: total,
        updatedAt: new Date(),
      })
      .where(eq(restaurantsTable.id, restaurantId));
  }
}
