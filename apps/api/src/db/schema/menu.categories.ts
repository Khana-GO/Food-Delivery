import {
  pgTable,
  uuid,
  varchar,
  timestamp,
} from "drizzle-orm/pg-core";

import { restaurantsTable } from "./restaurants.schema";

export const menuCategoriesTable = pgTable("menu_categories", {
  id: uuid("id")
    .primaryKey()
    .defaultRandom(),

  name: varchar("name", {
    length: 100,
  }).notNull(),

  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurantsTable.id, {
      onDelete: "cascade",
    }),

  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow(),
});

export type MenuCategory = typeof menuCategoriesTable.$inferSelect;
export type NewMenuCategory = typeof menuCategoriesTable.$inferInsert;