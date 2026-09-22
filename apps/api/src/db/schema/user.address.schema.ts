import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  doublePrecision,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';

export const addressesTable = pgTable(
  'addresses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 50 }).default('Home'),
    addressLine: text('address_line').notNull(),
    city: varchar('city', { length: 100 }).notNull(),
    state: varchar('state', { length: 100 }),
    country: varchar('country', { length: 100 }).notNull().default('Nepal'),
    postalCode: varchar('postal_code', { length: 20 }),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    isDefault: boolean('is_default').notNull().default(false),
    // Soft-delete flag: order rows reference addresses with ON DELETE RESTRICT,
    // so addresses used by past orders are deactivated instead of removed.
    isActive: boolean('is_active').notNull().default(true),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => [
    index('addresses_user_id_idx').on(table.userId),
    index('addresses_user_default_idx').on(table.userId, table.isDefault),
    index('addresses_user_active_idx').on(table.userId, table.isActive),
  ],
);

export type Address = typeof addressesTable.$inferSelect;
export type NewAddress = typeof addressesTable.$inferInsert;
