import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  pgEnum,
} from 'drizzle-orm/pg-core';

export const discountTypeEnum = pgEnum('discount_type', ['PERCENTAGE', 'FLAT']);

export const promotionsTable = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),

  code: varchar('code', { length: 50 }).notNull().unique(),
  description: text('description'),

  discountType: discountTypeEnum('discount_type').notNull(),
  discountValue: numeric('discount_value', {
    precision: 10,
    scale: 2,
  }).notNull(),

  minOrderAmount: numeric('min_order_amount', {
    precision: 10,
    scale: 2,
  }).default('0'),
  maxDiscount: numeric('max_discount', { precision: 10, scale: 2 }), // for percentage discounts

  usageLimit: integer('usage_limit').default(0), // 0 = unlimited
  usedCount: integer('used_count').default(0),

  validFrom: timestamp('valid_from').notNull(),
  validUntil: timestamp('valid_until').notNull(),

  isActive: boolean('is_active').default(true),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});

export type Promotion = typeof promotionsTable.$inferSelect;
export type NewPromotion = typeof promotionsTable.$inferInsert;
