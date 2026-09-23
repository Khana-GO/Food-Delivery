import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

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
    // Trigram index so category-name search is index-assisted (requires pg_trgm).
    index('menu_categories_name_trgm_idx').using(
      'gin',
      sql`${table.name} gin_trgm_ops`,
    ),
  ],
);

export type MenuCategory = typeof menuCategoriesTable.$inferSelect;
export type NewMenuCategory = typeof menuCategoriesTable.$inferInsert;
