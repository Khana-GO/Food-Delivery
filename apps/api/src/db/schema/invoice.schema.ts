// apps/api/src/db/schema/invoice.schema.ts
import {
  pgTable,
  uuid,
  varchar,
  numeric,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';
import { ordersTable } from './order.schema';
import { usersTable } from './user.schema';
import { restaurantsTable } from './restaurant.schema';

export const invoicesTable = pgTable('invoices', {
  id: uuid('id').primaryKey().defaultRandom(),

  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),

  customerId: uuid('customer_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  restaurantId: uuid('restaurant_id')
    .notNull()
    .references(() => restaurantsTable.id, { onDelete: 'cascade' }),

  invoiceNumber: varchar('invoice_number', { length: 50 }).notNull().unique(),

  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
  tax: numeric('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  deliveryFee: numeric('delivery_fee', { precision: 10, scale: 2 }).notNull(),
  discount: numeric('discount', { precision: 10, scale: 2 })
    .notNull()
    .default('0'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),

  paymentMethod: text('payment_method').notNull(),
  paymentStatus: text('payment_status').notNull(),

  issuedAt: timestamp('issued_at').notNull().defaultNow(),
  paidAt: timestamp('paid_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
