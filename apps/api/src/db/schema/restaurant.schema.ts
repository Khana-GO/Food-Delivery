import {
  boolean,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';

export const restaurantsTable = pgTable('restaurants', {
  // ─── Core Identity ───
  id: uuid('id').defaultRandom().primaryKey(),
  ownerId: uuid('owner_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  description: text('description'),

  // ─── Branding ───
  logoUrl: text('logo_url'),
  coverImageUrl: text('cover_image_url'),

  // ─── Contact ───
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),

  // ─── Address (Simplified - Local/District focused) ───
  // Since it's local, we only need detailed address, not country/city
  address: text('address').notNull(),
  wardNumber: integer('ward_number'),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),

  // ─── Business Info ───
  cuisineType: varchar('cuisine_type', { length: 100 }).notNull(),
  openingTime: time('opening_time'),
  closingTime: time('closing_time'),
  isOpen: boolean('is_open').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  isVerified: boolean('is_verified').notNull().default(false),

  // ─── Pricing ───
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 })
    .notNull()
    .default('0.00'),
  minimumOrderAmount: numeric('minimum_order_amount', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('30.00'),
  estimatedDeliveryTime: integer('estimated_delivery_time'),

  // ─── Rating ───
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }).default(
    '0',
  ),
  totalReviews: integer('total_reviews').default(0),

  // ─── Timestamps ───
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export type RestaurantsTable = typeof restaurantsTable.$inferSelect;
export type NewRestaurantsTable = typeof restaurantsTable.$inferInsert;
