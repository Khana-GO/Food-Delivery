import {
  boolean,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const restaurantsTable = pgTable('restaurants', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', {
    length: 255,
  }).notNull(),

  address: text('address').notNull(),

  ownerId: uuid('owner_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

    // cascade delete: if a user is deleted, all their restaurants will be deleted as well  

  description: text('description'),

  imageUrl: text('image_url'),

  cuisineType: varchar('cuisine_type', {
    length: 100,
  }).notNull(),

  isOpen: boolean('is_open').notNull().default(false),

  rating: real('rating').notNull().default(0),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type Restaurant = typeof restaurantsTable.$inferSelect;
export type NewRestaurant = typeof restaurantsTable.$inferInsert;
