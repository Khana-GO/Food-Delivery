import {
  boolean,
  pgTable,
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

  // ─── Relationships ───
  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: 'cascade' }),

  categoryId: uuid('category_id')
    .notNull()
    .references(() => menuCategoriesTable.id, { onDelete: 'cascade' }),

  // ─── Basic Info ───
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),

  // ─── Pricing ───
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),

  // ─── Image ───
  imageUrl: text('image_url'),

  // ─── Availability ───
  isAvailable: boolean('is_available').notNull().default(true),

  // ─── Timestamps ───
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;
