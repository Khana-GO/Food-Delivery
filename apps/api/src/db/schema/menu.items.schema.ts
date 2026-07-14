import {
  boolean,
  pgTable,
  real,
  text,
  timestamp,
  uuid,
  varchar,
  numeric,
} from 'drizzle-orm/pg-core';

import { menuCategoriesTable } from './menu.categories.schema';
import { restaurantsTable } from './restaurant.schema';

export const menuItemsTable = pgTable('menu_items', {
  id: uuid('id').primaryKey().defaultRandom(),

  name: varchar('name', {
    length: 255,
  }).notNull(),

  description: text('description'),

  price: numeric('price', {
    precision: 10, // it means the total number of digits that can be stored, including both sides of the decimal point.
    scale: 2, // it means the number of digits that can be stored to the right of the decimal point.
  }).notNull(),

  categoryId: uuid('category_id')
    .notNull()
    .references(() => menuCategoriesTable.id, {
      onDelete: 'cascade',
    }),

  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurantsTable.id, {
      onDelete: 'cascade',
    }),

  imageUrl: text('image_url'),

  isAvailable: boolean('is_available').notNull().default(true),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;
