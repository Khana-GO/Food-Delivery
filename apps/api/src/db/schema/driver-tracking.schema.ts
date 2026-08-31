import {
  pgTable,
  uuid,
  doublePrecision,
  timestamp,
  boolean,
  index,
  unique,
  text,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';
import { ordersTable, orderStatusEnum } from './order.schema';

export const driverTrackingTable = pgTable(
  'driver_tracking',
  {
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
    speed: doublePrecision('speed'), // m/s
    heading: doublePrecision('heading'), // degrees 0-360
    altitude: doublePrecision('altitude'),

    isOnline: boolean('is_online').default(true).notNull(),

    lastUpdatedAt: timestamp('last_updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique('driver_tracking_driver_order_unique').on(
      table.driverId,
      table.orderId,
    ),
    index('driver_tracking_order_idx').on(table.orderId),
    index('driver_tracking_driver_idx').on(table.driverId),
    index('driver_tracking_updated_idx').on(table.lastUpdatedAt),
  ],
);

export const driverLocationHistoryTable = pgTable(
  'driver_location_history',
  {
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
    recordedAt: timestamp('recorded_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('driver_history_order_idx').on(table.orderId),
    index('driver_history_driver_idx').on(table.driverId),
    index('driver_history_recorded_idx').on(table.recordedAt),
  ],
);

export const orderStatusHistoryTable = pgTable(
  'order_status_history',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    orderId: uuid('order_id')
      .notNull()
      .references(() => ordersTable.id, { onDelete: 'cascade' }),
    fromStatus: orderStatusEnum('from_status'),
    toStatus: orderStatusEnum('to_status').notNull(),
    changedBy: uuid('changed_by').references(() => usersTable.id, {
      onDelete: 'set null',
    }),
    reason: text('reason'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index('order_status_history_order_idx').on(table.orderId),
    index('order_status_history_created_idx').on(table.createdAt),
  ],
);

// Re-export improved types
export type DriverTracking = typeof driverTrackingTable.$inferSelect;
export type NewDriverTracking = typeof driverTrackingTable.$inferInsert;
export type DriverLocationHistory =
  typeof driverLocationHistoryTable.$inferSelect;
export type OrderStatusHistory = typeof orderStatusHistoryTable.$inferSelect;
