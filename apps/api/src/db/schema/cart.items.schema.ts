import {
  integer,
  pgTable,
  real,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { cartsTable } from './cart.schema';
import { menuItemsTable } from './menu.items.schema';

export const cartItemsTable = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),

  cartId: uuid('cart_id')
    .notNull()
    .references(() => cartsTable.id, {
      onDelete: 'cascade',
    }),

  menuItemId: uuid('menu_item_id')
    .notNull()
    .references(() => menuItemsTable.id, {
      onDelete: 'cascade',
    }),

  quantity: integer('quantity')
    .notNull()
    .default(1),

  price: real('price')
    .notNull(),

  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(),

  updatedAt: timestamp('updated_at')
    .notNull()
    .defaultNow(),
});

export type CartItem = typeof cartItemsTable.$inferSelect;
export type NewCartItem = typeof cartItemsTable.$inferInsert;