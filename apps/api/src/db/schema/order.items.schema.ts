import {
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { menuItemsTable } from './menu.items.schema';
import { ordersTable } from './order.schema';

export const orderItemsTable = pgTable(
  'order_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, {
        onDelete: 'cascade',
      }),

    menuItemId: uuid('menu_item_id')
      .notNull()
      .references(() => menuItemsTable.id, {
        onDelete: 'restrict',
      }),

    // Snapshot name at order time – keeps history if menu item renamed/deleted
    itemNameSnapshot: text('item_name_snapshot'),

    quantity: integer('quantity').notNull(),

    unitPrice: numeric('unit_price', {
      precision: 10,
      scale: 2,
    }).notNull(),

    totalPrice: numeric('total_price', {
      precision: 10,
      scale: 2,
    }).notNull(),

    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('order_items_order_id_idx').on(table.orderId),
    index('order_items_menu_item_id_idx').on(table.menuItemId),
  ],
);
export type OrderItem = typeof orderItemsTable.$inferSelect;
export type NewOrderItem = typeof orderItemsTable.$inferInsert;
