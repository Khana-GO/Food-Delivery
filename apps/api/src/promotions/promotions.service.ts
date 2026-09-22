import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, count, sql, desc } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  promotionsTable,
  type NewPromotion,
} from '../db/schema/promotions.schema';
import { promotionUsageTable } from '../db/schema/promotion-usage.schema';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { ValidatePromotionDto } from './dto/validate-promotion.dto';
import { PromotionResponseDto } from './dto/promotion-response.dto';
import { CacheService } from '../redis/cache.service';
import * as schema from '../db/schema';

@Injectable()
export class PromotionsService {
  private readonly logger = new Logger(PromotionsService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cache: CacheService,
  ) {}

  private key(code: string) {
    return `promotion:${code}`;
  }

  // ─── CREATE PROMOTION ───
  async create(dto: CreatePromotionDto): Promise<PromotionResponseDto> {
    const existing = await this.db.query.promotionsTable.findFirst({
      where: eq(promotionsTable.code, dto.code.toUpperCase()),
    });
    if (existing) {
      throw new BadRequestException('Promotion code already exists');
    }

    const [promotion] = await this.db
      .insert(promotionsTable)
      .values({
        code: dto.code.toUpperCase(),
        description: dto.description,
        discountType: dto.discountType,
        discountValue: dto.discountValue.toString(),
        minOrderAmount: dto.minOrderAmount?.toString() || '0',
        maxDiscount: dto.maxDiscount?.toString(),
        usageLimit: dto.usageLimit || 0,
        validFrom: dto.validFrom,
        validUntil: dto.validUntil,
        isActive: dto.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    await this.cache.delByPattern('promotion:*');
    this.logger.log(`Promotion created: ${promotion.code}`);
    return promotion as unknown as PromotionResponseDto;
  }

  // ─── VALIDATE PROMOTION ───
  async validatePromotion(
    dto: ValidatePromotionDto,
    userId?: string,
  ): Promise<{
    valid: boolean;
    message: string;
    discountAmount?: number;
    discountType?: string;
    discountValue?: number;
  }> {
    const code = dto.code.toUpperCase();

    // Always read fresh from the database: the row carries `usedCount`, which
    // changes on every redemption. Caching it (even for 300s) let customers keep
    // redeeming a code after its usage limit had been exhausted.
    const promotion: any = await this.db.query.promotionsTable.findFirst({
      where: eq(promotionsTable.code, code),
    });

    if (!promotion) {
      return { valid: false, message: 'Invalid promotion code' };
    }

    // Check active
    if (!promotion.isActive) {
      return { valid: false, message: 'Promotion is not active' };
    }

    // Check date validity
    const now = new Date();
    if (promotion.validFrom > now) {
      return { valid: false, message: 'Promotion has not started yet' };
    }
    if (promotion.validUntil < now) {
      return { valid: false, message: 'Promotion has expired' };
    }

    // Check global usage limit against the live counter
    const usageLimit = Number(promotion.usageLimit ?? 0);
    if (usageLimit > 0 && Number(promotion.usedCount ?? 0) >= usageLimit) {
      return { valid: false, message: 'Promotion usage limit exceeded' };
    }

    // Check per-user usage. A promotion with a global usage cap is a single-use
    // code by definition, so each customer may redeem it once; `usageLimit = 0`
    // means "unlimited" and is intentionally reusable.
    if (userId && usageLimit > 0) {
      const [userUsage] = await this.db
        .select({ total: count() })
        .from(promotionUsageTable)
        .where(
          and(
            eq(promotionUsageTable.promotionId, promotion.id),
            eq(promotionUsageTable.userId, userId),
          ),
        );
      if (Number(userUsage?.total ?? 0) > 0) {
        return {
          valid: false,
          message: 'You have already used this promotion',
        };
      }
    }

    // Check minimum order
    const minOrder = parseFloat(promotion.minOrderAmount);
    if (dto.subtotal < minOrder) {
      return {
        valid: false,
        message: `Minimum order amount of Rs. ${minOrder} required`,
      };
    }

    // Calculate discount. Round to 2 decimals the same way the order service
    // does, and never exceed the subtotal, so the amount shown on checkout is
    // exactly the amount charged.
    let discountAmount = 0;
    const discountValue = parseFloat(promotion.discountValue);
    if (promotion.discountType === 'PERCENTAGE') {
      discountAmount = (dto.subtotal * discountValue) / 100;
      const maxDiscount = promotion.maxDiscount
        ? parseFloat(promotion.maxDiscount)
        : Infinity;
      if (discountAmount > maxDiscount) {
        discountAmount = maxDiscount;
      }
    } else {
      discountAmount = discountValue;
    }
    discountAmount = Math.min(
      Math.round(discountAmount * 100) / 100,
      Math.round(dto.subtotal * 100) / 100,
    );

    return {
      valid: true,
      message: 'Promotion applied successfully',
      discountAmount,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue,
    };
  }

  // ─── APPLY PROMOTION (when order is placed) ───
  async applyPromotion(
    code: string,
    userId: string,
    orderId: string,
    discountAmount: number,
  ): Promise<void> {
    const promotion = await this.db.query.promotionsTable.findFirst({
      where: eq(promotionsTable.code, code.toUpperCase()),
    });
    if (!promotion) throw new NotFoundException('Promotion not found');

    // Atomic consume: the increment only happens while the counter is still
    // below the limit, so concurrent checkouts cannot overshoot it. (A plain
    // read-then-write increment could, because two requests can both read the
    // same value.)
    const updated = await this.db
      .update(promotionsTable)
      .set({
        usedCount: sql`${promotionsTable.usedCount} + 1`,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(promotionsTable.id, promotion.id),
          or(
            eq(promotionsTable.usageLimit, 0),
            sql`${promotionsTable.usedCount} < ${promotionsTable.usageLimit}`,
          ),
        ),
      )
      .returning({ id: promotionsTable.id });

    if (!updated || updated.length === 0) {
      throw new ConflictException('Promotion usage limit exceeded');
    }

    await this.db.insert(promotionUsageTable).values({
      promotionId: promotion.id,
      userId,
      orderId,
      discountAmount: discountAmount.toString(),
      appliedAt: new Date(),
    });

    await this.cache.del(this.key(code));
    this.logger.log(`Promotion ${code} applied to order ${orderId}`);
  }

  // ─── GET ALL PROMOTIONS (Admin) ───
  async getAllPromotions(): Promise<PromotionResponseDto[]> {
    const promotions = await this.db
      .select()
      .from(promotionsTable)
      .orderBy(desc(promotionsTable.createdAt));
    return promotions as unknown as PromotionResponseDto[];
  }

  // ─── DELETE PROMOTION ───
  async deletePromotion(id: string): Promise<{ message: string }> {
    const promotion = await this.db.query.promotionsTable.findFirst({
      where: eq(promotionsTable.id, id),
    });
    if (!promotion) throw new NotFoundException('Promotion not found');

    await this.db.delete(promotionsTable).where(eq(promotionsTable.id, id));
    await this.cache.del(this.key(promotion.code));

    return { message: 'Promotion deleted' };
  }
}
