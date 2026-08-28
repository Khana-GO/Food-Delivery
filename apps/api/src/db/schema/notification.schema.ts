import {
  boolean,
  index,
  jsonb,
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const notificationsTable = pgTable(
  'notifications',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, {
        onDelete: 'cascade',
      }),

    type: varchar('type', {
      length: 50,
    }).notNull(),

    title: varchar('title', {
      length: 255,
    }).notNull(),

    body: text('body').notNull(),

    data: jsonb('data'),

    isRead: boolean('is_read').notNull().default(false),

    isPushSent: boolean('is_push_sent').notNull().default(false),

    createdAt: timestamp('created_at').notNull().defaultNow(),

    readAt: timestamp('read_at'),
  },
  (table) => [
    index('notifications_user_id_idx').on(table.userId),

    index('notifications_created_at_idx').on(table.createdAt.desc()),
  ],
);

export type Notification = typeof notificationsTable.$inferSelect;

export type NewNotification = typeof notificationsTable.$inferInsert;
