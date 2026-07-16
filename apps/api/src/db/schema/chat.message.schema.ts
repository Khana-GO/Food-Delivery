import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

import { usersTable } from './user.schema';

export const chatRoleEnum = pgEnum('chat_role', [
  'user',
  'assistant',
]);

export const chatMessagesTable = pgTable('chat_messages', {
  id: uuid('id').primaryKey().defaultRandom(),

  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, {
      onDelete: 'cascade',
    }),

  role: chatRoleEnum().notNull(),

  message: text('message').notNull(),

  createdAt: timestamp('created_at')
    .notNull()
    .defaultNow(),
});

export type ChatMessage = typeof chatMessagesTable.$inferSelect;
export type NewChatMessage = typeof chatMessagesTable.$inferInsert;