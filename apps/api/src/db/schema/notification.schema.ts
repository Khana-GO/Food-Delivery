import {
  boolean,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const notificationTypeEnum = pgEnum('notification_type', [
  'order',
  'promotion',
  'offer',
  'payment',
  'system',
]);

export const notificationsTable = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  title: text('title').notNull(),

  message: text('message').notNull(),

  type: notificationTypeEnum('type').notNull(),

  isRead: boolean('is_read').default(false).notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
});
