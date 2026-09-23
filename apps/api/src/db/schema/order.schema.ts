import {
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

import { usersTable } from './user.schema';
import { restaurantsTable } from './restaurant.schema';
import { addressesTable } from './user.address.schema';

export const orderStatusEnum = pgEnum('order_status', [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'READY',
  'PICKED_UP',
  'DELIVERED',
  'CANCELLED',
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

export const ordersTable = pgTable(
  'orders',
  {
    id: uuid('id').primaryKey().defaultRandom(),

    customerId: uuid('customer_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    restaurantId: uuid('restaurant_id')
      .notNull()
      .references(() => restaurantsTable.id, {
        onDelete: 'cascade',
      }),

    driverId: uuid('driver_id').references(() => usersTable.id, {
      onDelete: 'set null',
    }),

    addressId: uuid('address_id')
      .notNull()
      .references(() => addressesTable.id, {
        onDelete: 'restrict',
      }),

    // Snapshot of delivery address at order time (address may change later)
    deliveryAddressSnapshot: text('delivery_address_snapshot'),

    subtotal: numeric('subtotal', {
      precision: 10,
      scale: 2,
    }).notNull(),

    deliveryFee: numeric('delivery_fee', {
      precision: 10,
      scale: 2,
    }).notNull(),

    totalAmount: numeric('total_amount', {
      precision: 10,
      scale: 2,
    }).notNull(),

    discount: numeric('discount', { precision: 10, scale: 2 })
      .notNull()
      .default('0'),

    notes: text('notes'),

    // Unique per non-null payment reference — prevents a single gateway
    // transaction from being replayed into multiple paid orders.
    paymentId: text('payment_id'),

    paymentMethod: paymentMethodEnum('payment_method')
      .notNull()
      .default('OFFLINE'),

    paymentStatus: paymentStatusEnum('payment_status')
      .notNull()
      .default('PENDING'),

    orderStatus: orderStatusEnum('order_status').notNull().default('PENDING'),

    // minutes until estimated delivery (was timestamp – type mismatch fixed)
    estimatedDeliveryMinutes: integer('estimated_delivery_minutes'),

    estimatedDeliveryTime: timestamp('estimated_delivery_time'),

    deliveredAt: timestamp('delivered_at'),

    createdAt: timestamp('created_at').notNull().defaultNow(),

    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('orders_customer_id_idx').on(table.customerId),
    index('orders_restaurant_id_idx').on(table.restaurantId),
    index('orders_driver_id_idx').on(table.driverId),
    index('orders_status_idx').on(table.orderStatus),
    index('orders_created_at_idx').on(table.createdAt),
    index('orders_address_id_idx').on(table.addressId),
    // Serves the "trending restaurants" aggregation (orders per restaurant over
    // a recent time window).
    index('orders_restaurant_created_at_idx').on(
      table.restaurantId,
      table.createdAt,
    ),
    uniqueIndex('orders_payment_id_unique')
      .on(table.paymentId)
      .where(sql`${table.paymentId} IS NOT NULL`),
  ],
);

export type Order = typeof ordersTable.$inferSelect;
export type NewOrder = typeof ordersTable.$inferInsert;
