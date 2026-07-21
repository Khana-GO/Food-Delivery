import { Injectable, Inject } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ReviewsService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  async create(createReviewDto: any, customerId: string) {
    const id = uuidv4();
    await this.db.insert(schema.reviewsTable).values({
      id,
      customerId,
      restaurantId: createReviewDto.restaurantId,
      itemId: createReviewDto.itemId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
    });
    return { id, success: true };
  }

  async findAllForRestaurant(restaurantId: string) {
    return this.db.query.reviewsTable.findMany({
      where: eq(schema.reviewsTable.restaurantId, restaurantId),
      orderBy: (reviews, { desc }) => [desc(reviews.createdAt)],
    });
  }

  async findOne(id: string) {
    return this.db.query.reviewsTable.findFirst({
      where: eq(schema.reviewsTable.id, id),
    });
  }

  async update(id: string, customerId: string, updateReviewDto: any) {
    await this.db.update(schema.reviewsTable)
      .set({ ...updateReviewDto, updatedAt: new Date() })
      .where(and(eq(schema.reviewsTable.id, id), eq(schema.reviewsTable.customerId, customerId)));
    return { id, success: true };
  }

  async remove(id: string, customerId: string) {
    await this.db.delete(schema.reviewsTable)
      .where(and(eq(schema.reviewsTable.id, id), eq(schema.reviewsTable.customerId, customerId)));
    return { success: true };
  }
}
