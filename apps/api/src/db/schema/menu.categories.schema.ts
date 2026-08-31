import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';

import { restaurantsTable } from './restaurant.schema';

export const menuCategoriesTable = pgTable(
  'menu_categories',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    name: varchar('name', {
      length: 100,
    }).notNull(),

    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurantsTable.id, {
        onDelete: 'cascade',
      }),

    createdAt: timestamp('created_at').notNull().defaultNow(),

    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('menu_categories_restaurant_name_unique').on(
      table.restaurantId,
      table.name,
    ),
    index('menu_categories_restaurant_id_idx').on(table.restaurantId),
  ],
);

export type MenuCategory = typeof menuCategoriesTable.$inferSelect;
export type NewMenuCategory = typeof menuCategoriesTable.$inferInsert;
