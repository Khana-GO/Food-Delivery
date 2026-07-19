import {
  pgTable,
  pgEnum,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  index,
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
  }),

  password: varchar('password', {
    length: 255,
  }),

  phone: varchar('phone', {
    length: 15,
  }).notNull().unique(),

  role: userRoleEnum().notNull().default('CUSTOMER'),

  imageUrl: varchar('image_url', {
    length: 500,
  }),

  pushToken: text('push_token'),

  lastLoginAt: timestamp('last_login_at'),

  isOnline: boolean('is_online').notNull().default(false),

  isVerified: boolean('is_verified').notNull().default(false),
  otpCode: varchar('otp_code', { length: 6 }),
  otpExpiry: timestamp('otp_expiry'),
  
  verifiedAt: timestamp('verified_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),

  updatedAt: timestamp('updated_at').notNull().defaultNow(),

  deletedAt: timestamp('deleted_at'),
  },
);

export type UsersTable = typeof usersTable.$inferSelect;
export type NewUsersTable = typeof usersTable.$inferInsert;
