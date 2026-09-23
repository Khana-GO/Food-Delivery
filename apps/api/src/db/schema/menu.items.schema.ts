import {
  boolean,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  numeric,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { menuCategoriesTable } from './menu.categories.schema';
import { restaurantsTable } from './restaurant.schema';

export const menuItemsTable = pgTable(
  'menu_items',
  {
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
  },
  (table) => [
    // Foreign-key lookups (menu listing, dish search joins). Postgres does not
    // index foreign keys automatically.
    index('menu_items_restaurant_id_idx').on(table.restaurantId),
    index('menu_items_category_id_idx').on(table.categoryId),
    index('menu_items_is_available_idx').on(table.isAvailable),
    index('menu_items_name_idx').on(table.name),
    index('menu_items_restaurant_available_idx').on(
      table.restaurantId,
      table.isAvailable,
    ),
    // Trigram index for `ILIKE '%term%'` dish search (requires pg_trgm).
    index('menu_items_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`,
    ),
  ],
);

export type MenuItem = typeof menuItemsTable.$inferSelect;
export type NewMenuItem = typeof menuItemsTable.$inferInsert;
