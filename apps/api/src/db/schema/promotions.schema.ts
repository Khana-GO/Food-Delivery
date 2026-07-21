import {
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

export const promotionsTable = pgTable('promotions', {
  id: uuid('id').primaryKey().defaultRandom(),

  title: varchar('title', {
    length: 255,
  }).notNull(),

  subtitle: varchar('subtitle', {
    length: 255,
  }),

  imageUrl: text('image_url').notNull(),

  ctaText: varchar('cta_text', {
    length: 50,
  }).notNull(),

  destinationUrl: text('destination_url'),

  isActive: boolean('is_active').notNull().default(true),

  startDate: timestamp('start_date'),

  endDate: timestamp('end_date'),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Promotion = typeof promotionsTable.$inferSelect;
export type NewPromotion = typeof promotionsTable.$inferInsert;
