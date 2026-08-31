import {
  pgTable,
  uuid,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';
import { restaurantsTable } from './restaurant.schema';

export const cartsTable = pgTable(
  'carts',
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

    createdAt: timestamp('created_at').notNull().defaultNow(),

    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('carts_user_id_unique').on(table.userId),
    index('carts_restaurant_id_idx').on(table.restaurantId),
  ],
);

export type Cart = typeof cartsTable.$inferSelect;
export type NewCart = typeof cartsTable.$inferInsert;
