import {
  pgTable,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

import { usersTable } from "./user.schema";
import { restaurantsTable } from "./restaurant.schema";

export const favoriteRestaurantsTable = pgTable(
  "favorite_restaurants",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    userId: uuid("user_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),

    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurantsTable.id, {
        onDelete: "cascade",
      }),

    createdAt: timestamp("created_at")
      .defaultNow()
      .notNull(),
  },
  (table) => [
    unique("favorite_restaurants_user_restaurant_unique").on(
      table.userId,
      table.restaurantId
    ),
  ]
);