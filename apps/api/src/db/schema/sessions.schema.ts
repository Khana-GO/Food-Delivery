// src/sessions/sessions.table.ts
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { usersTable } from '.';

export const sessionsTable = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    userId: uuid('user_id')
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),

    // One row per refresh token: a duplicated hash would let two live sessions
    // share a token and make revocation-by-token miss one of them.
    refreshTokenHash: varchar('refresh_token_hash', { length: 255 }).notNull(),

    userAgent: varchar('user_agent', { length: 255 }),
    ipAddress: varchar('ip_address', { length: 45 }),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => [
    index('sessions_user_id_idx').on(table.userId),
    uniqueIndex('sessions_refresh_token_hash_unique').on(
      table.refreshTokenHash,
    ),
  ],
);

export type SessionsTable = typeof sessionsTable.$inferSelect;
export type NewSessionsTable = typeof sessionsTable.$inferInsert;
