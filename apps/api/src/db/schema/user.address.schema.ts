import {
  boolean,
  doublePrecision,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const addressesTable = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  fullAddress: text('full_address').notNull(),

  city: text('city').notNull(),

  state: text('state').notNull(),

  country: text('country').notNull(),

  postalCode: text('postal_code'),

  latitude: doublePrecision('latitude'),

  longitude: doublePrecision('longitude'),

  isDefault: boolean('is_default').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),

  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
});
