import {
  boolean,
  doublePrecision,
  integer,
  numeric,
  pgTable,
  real,
  text,
  time,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const restaurantsTable = pgTable('restaurants', {
  id: uuid('id').defaultRandom().primaryKey(),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  name: varchar('name', { length: 255 }).notNull(),

  slug: varchar('slug', { length: 255 }).notNull().unique(),

  description: text('description'),

  logoUrl: text('logo_url'),

  coverImageUrl: text('cover_image_url'),

  phone: varchar('phone', { length: 20 }),

  email: varchar('email', { length: 255 }),

  addressLine: text('address_line').notNull(),

  city: varchar('city', { length: 100 }).notNull(),

  country: varchar('country', { length: 100 }).notNull(),

  postalCode: varchar('postal_code', { length: 20 }),

  latitude: doublePrecision('latitude'),

  longitude: doublePrecision('longitude'),

  cuisineType: varchar('cuisine_type', {
    length: 100,
  }).notNull(),

  openingTime: time('opening_time'),

  closingTime: time('closing_time'),

  averageRating: real('average_rating').notNull().default(0),

  totalReviews: integer('total_reviews').notNull().default(0),

  deliveryFee: numeric('delivery_fee', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0.00'),

  minimumOrderAmount: numeric('minimum_order_amount', {
    precision: 10,
    scale: 2,
  })
    .notNull()
    .default('0.00'),

  estimatedDeliveryTime: integer('estimated_delivery_time'),

  isOpen: boolean('is_open').notNull().default(false),

  isActive: boolean('is_active').notNull().default(true),

  isVerified: boolean('is_verified').notNull().default(false),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  deletedAt: timestamp('deleted_at'),
});

export type RestaurantsTable = typeof restaurantsTable.$inferSelect;
export type NewRestaurantsTable = typeof restaurantsTable.$inferInsert;
