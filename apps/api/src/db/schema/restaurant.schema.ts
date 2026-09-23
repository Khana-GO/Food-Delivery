import {
  boolean,
  doublePrecision,
  index,
  integer,
  numeric,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { usersTable } from './user.schema';

export const restaurantsTable = pgTable(
  'restaurants',
  {
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
    averageRating: numeric('average_rating', {
      precision: 3,
      scale: 2,
    }).default('0'),
    totalReviews: integer('total_reviews').default(0),

    // ─── Timestamps ───
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => [
    // Discovery filters (catalogue listing, Explore feeds, admin lists).
    index('restaurants_is_active_idx').on(table.isActive),
    index('restaurants_is_verified_idx').on(table.isVerified),
    index('restaurants_deleted_at_idx').on(table.deletedAt),
    index('restaurants_cuisine_type_idx').on(table.cuisineType),
    index('restaurants_average_rating_idx').on(table.averageRating),
    index('restaurants_created_at_idx').on(table.createdAt),
    index('restaurants_minimum_order_amount_idx').on(table.minimumOrderAmount),
    index('restaurants_estimated_delivery_time_idx').on(
      table.estimatedDeliveryTime,
    ),
    // Search: `ILIKE '%term%'` cannot use a btree index. Trigram GIN indexes make
    // substring/typo-tolerant matching on these columns index-assisted.
    // Requires `CREATE EXTENSION IF NOT EXISTS pg_trgm` (see drizzle/00010_*.sql).
    index('restaurants_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`,
    ),
    index('restaurants_cuisine_type_trgm_idx').using(
      'gin',
      sql`${table.cuisineType} gin_trgm_ops`,
    ),
  ],
);

export type RestaurantsTable = typeof restaurantsTable.$inferSelect;
export type NewRestaurantsTable = typeof restaurantsTable.$inferInsert;
