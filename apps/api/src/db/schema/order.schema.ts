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

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING', // waiting for payment
  'CONFIRMED', // pyament confirmed
  'PREPARING', // preparing
  'READY', // ready for driver pickup
  'PICKED_UP', // picked up by driver
  'DELIVERED', // order delivered
  'CANCELLED', // order cancelled
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'ONLINE',
  'OFFLINE',
]);

export const paymentStatusEnum = pgEnum('payment_status', [
  'PENDING',
  'PAID',
  'FAILED',
  'REFUNDED',
]);

export const ordersTable = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),

  itemId: uuid('item_id')
    .notNull()
    .references(() => menuItemsTable.id, {
      onDelete: 'cascade',
    }),

  customerId: uuid('customer_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  driverId: uuid('driver_id')
    .notNull()
    .references(() => usersTable.id),

  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),

  deliveryAddress: text('delivery_address').notNull(),

  paymentId: text('payment_id'),

  paymentMethod: paymentMethodEnum('payment_method')
    .notNull()
    .default('OFFLINE'),

  orderStatus: orderStatusEnum('order_status').notNull().default('PENDING'),

  paymentStatus: paymentStatusEnum('payment_status')
    .notNull()
    .default('PENDING'),

  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurantsTable.id),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});


export type OrdersTable = typeof ordersTable.$inferSelect;
export type NewOrdersTable = typeof ordersTable.$inferInsert;