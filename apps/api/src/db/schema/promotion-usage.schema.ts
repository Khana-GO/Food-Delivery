import { pgTable, uuid, timestamp, numeric } from 'drizzle-orm/pg-core';
import { usersTable } from './user.schema';
import { promotionsTable } from './promotions.schema';
import { ordersTable } from './order.schema';

export const promotionUsageTable = pgTable('promotion_usage', {
  id: uuid('id').primaryKey().defaultRandom(),

  promotionId: uuid('promotion_id')
    .notNull()
    .references(() => promotionsTable.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id')
    .notNull()
    .references(() => ordersTable.id, { onDelete: 'cascade' }),

  discountAmount: numeric('discount_amount', {
    precision: 10,
    scale: 2,
  }).notNull(),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
});
