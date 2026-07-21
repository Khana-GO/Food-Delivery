import { Injectable, Inject } from '@nestjs/common';
import { DATABASE } from '../db/database.constants';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class NotificationsService {
  constructor(@Inject(DATABASE) private readonly db: NeonHttpDatabase<typeof schema>) {}

  async create(createNotificationDto: any, userId: string) {
    const id = uuidv4();
    await this.db.insert(schema.notificationsTable).values({
      id,
      userId,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      type: createNotificationDto.type || 'system',
      isRead: false,
    });
    return { id, success: true };
  }

  async findAllForUser(userId: string) {
    return this.db.query.notificationsTable.findMany({
      where: eq(schema.notificationsTable.userId, userId),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }

  async markAsRead(id: string, userId: string) {
    await this.db.update(schema.notificationsTable)
      .set({ isRead: true })
      .where(and(eq(schema.notificationsTable.id, id), eq(schema.notificationsTable.userId, userId)));
    return { id, success: true };
  }

  async remove(id: string, userId: string) {
    await this.db.delete(schema.notificationsTable)
      .where(and(eq(schema.notificationsTable.id, id), eq(schema.notificationsTable.userId, userId)));
    return { success: true };
  }
}
