import {
  pgTable,
  uuid,
  doublePrecision,
  timestamp,
  text,
  boolean,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';
import { ordersTable } from './order.schema';

export const driverTrackingTable = pgTable('driver_tracking', {
  id: uuid('id').defaultRandom().primaryKey(),

  driverId: uuid('driver_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),

  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),

  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),

  accuracy: doublePrecision('accuracy'),
  speed: doublePrecision('speed'),
  heading: doublePrecision('heading'),

  isOnline: boolean('is_online').default(true),

  lastUpdatedAt: timestamp('last_updated_at').notNull().defaultNow(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type DriverTracking = typeof driverTrackingTable.$inferSelect;
export type NewDriverTracking = typeof driverTrackingTable.$inferInsert;
