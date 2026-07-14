import {
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { menuItemsTable } from './menu.items.schema';
import { usersTable } from './user.schema';
import { restaurantsTable } from './restaurant.schema';
import { ordersTable } from './order.schema';

export const orderItem = pgTable('order_item', {
  id: uuid('id').primaryKey().defaultRandom(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),

  itemId: uuid('item_id')
    .notNull()
    .references(() => menuItemsTable.id, {
      onDelete: 'cascade',
    }),

  quantity: numeric('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type OrderItem = typeof orderItem.$inferSelect;
export type NewOrderItem = typeof orderItem.$inferInsert;
