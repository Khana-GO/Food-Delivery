import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'CUSTOMER',
  'RESTAURANT_OWNER',
  'DRIVER',
  'ADMIN',
]);

export const usersTable = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),

  firstName: varchar('first_name', {
    length: 100,
  }).notNull(),

  lastName: varchar('last_name', {
    length: 100,
  }).notNull(),

  email: varchar('email', {
    length: 255,
  })
    .notNull()
    .unique(),

  password: varchar('password', {
    length: 255,
  }).notNull(),

  phone: varchar('phone', {
    length: 20,
  }),

  role: userRoleEnum().notNull().default('CUSTOMER'),

  imageUrl: text('image_url'),

  pushToken: text('push_token'),

  isOnline: boolean('is_online').notNull().default(false),

  isVerified: boolean('is_verified').notNull().default(false),

  verifiedAt: timestamp('verified_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  deletedAt: timestamp('deleted_at'),
});

export type UsersTable = typeof usersTable.$inferSelect;
export type NewUsersTable = typeof usersTable.$inferInsert;
