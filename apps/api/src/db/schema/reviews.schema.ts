import {
  integer,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';
import { restaurantsTable } from './restaurant.schema';
import { menuItemsTable } from './menu.items.schema';

export const reviewsTable = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurantsTable.id, {
        onDelete: 'cascade',
      }),

    itemId: uuid('item_id').references(() => menuItemsTable.id, {
      onDelete: 'set null',
    }),

    rating: integer('rating').notNull(),

    comment: text('comment'),

    createdAt: timestamp('created_at').defaultNow().notNull(),

    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    unique('reviews_user_restaurant_unique').on(
      table.userId,
      table.restaurantId,
    ),
  ],
);
