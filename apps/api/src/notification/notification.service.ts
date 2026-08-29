// apps/api/src/notifications/notifications.service.ts
import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, desc, count, sql } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';
import * as schema from '../db/schema';
import { notificationsTable } from '../db/schema';
import { usersTable } from '../db/schema/user.schema';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      this.logger.error(`[${context}] Error:`, error);
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An error occurred while processing your request',
      );
    }
  }

  // ─── CREATE NOTIFICATION ───
  async create(dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.handleDbOperation(async () => {
      const [notification] = await this.db
        .insert(schema.notificationsTable)
        .values({
          userId: dto.userId,
          type: dto.type,
          title: dto.title,
          body: dto.body,
          data: dto.data,
          isRead: dto.isRead ?? false,
          isPushSent: dto.isPushSent ?? false,
          createdAt: new Date(),
        })
        .returning();

      if (!notification) {
        throw new InternalServerErrorException('Failed to create notification');
      }

      this.logger.log(
        `Notification created for user ${dto.userId}: ${dto.title}`,
      );
      return new NotificationResponseDto(notification);
    }, 'create');
  }

  // ─── FIND ALL BY USER ───
  async findByUser(
    userId: string,
    pagination: NotificationPaginationDto,
  ): Promise<{
    data: NotificationResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.handleDbOperation(async () => {
      const { page = 1, limit = 10, isRead, type } = pagination;

      const conditions: any[] = [eq(schema.notificationsTable.userId, userId)];

      if (isRead !== undefined) {
        conditions.push(eq(schema.notificationsTable.isRead, isRead));
      }

      if (type) {
        conditions.push(eq(notificationsTable.type, type));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await this.db
        .select({ total: count() })
        .from(notificationsTable)
        .where(whereClause);

      const total = countResult?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const notifications = await this.db
        .select()
        .from(notificationsTable)
        .where(whereClause)
        .orderBy(desc(notificationsTable.createdAt))
        .limit(limit)
        .offset(offset);

      return {
        data: notifications.map((n) => new NotificationResponseDto(n)),
        total,
        page,
        limit,
        totalPages,
      };
    }, 'findByUser');
  }

  // ─── GET UNREAD COUNT ───
  async getUnreadCount(userId: string): Promise<{ count: number }> {
    return this.handleDbOperation(async () => {
      const [result] = await this.db
        .select({ count: count() })
        .from(notificationsTable)
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false),
          ),
        );

      return { count: result?.count || 0 };
    }, 'getUnreadCount');
  }

  // ─── MARK AS READ ───
  async markAsRead(
    id: string,
    userId: string,
  ): Promise<NotificationResponseDto> {
    return this.handleDbOperation(async () => {
      const [updated] = await this.db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notificationsTable.id, id),
            eq(notificationsTable.userId, userId),
          ),
        )
        .returning();

      if (!updated) {
        throw new NotFoundException('Notification not found or already read');
      }

      this.logger.log(`Notification ${id} marked as read`);
      return new NotificationResponseDto(updated);
    }, 'markAsRead');
  }

  // ─── MARK ALL AS READ ───
  async markAllAsRead(
    userId: string,
  ): Promise<{ message: string; count: number }> {
    return this.handleDbOperation(async () => {
      const result = await this.db
        .update(notificationsTable)
        .set({
          isRead: true,
          readAt: new Date(),
        })
        .where(
          and(
            eq(notificationsTable.userId, userId),
            eq(notificationsTable.isRead, false),
          ),
        )
        .returning();

      const count = result.length;
      this.logger.log(
        `Marked ${count} notifications as read for user ${userId}`,
      );
      return { message: `${count} notifications marked as read`, count };
    }, 'markAllAsRead');
  }

  // ─── DELETE NOTIFICATION ───
  async delete(id: string, userId: string): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const result = await this.db
        .delete(notificationsTable)
        .where(
          and(
            eq(notificationsTable.id, id),
            eq(notificationsTable.userId, userId),
          ),
        )
        .returning();

      if (result.length === 0) {
        throw new NotFoundException('Notification not found');
      }

      this.logger.log(`Notification ${id} deleted`);
      return { message: 'Notification deleted successfully' };
    }, 'delete');
  }

  // ─── BULK DELETE (Admin only) ───
  async deleteAll(userId: string): Promise<{ message: string; count: number }> {
    return this.handleDbOperation(async () => {
      const result = await this.db
        .delete(notificationsTable)
        .where(eq(notificationsTable.userId, userId))
        .returning();

      const count = result.length;
      this.logger.log(`Deleted all ${count} notifications for user ${userId}`);
      return { message: `Deleted ${count} notifications`, count };
    }, 'deleteAll');
  }

  // ─── BULK CREATE ───
  async createMany(
    dtos: CreateNotificationDto[],
  ): Promise<NotificationResponseDto[]> {
    if (!dtos.length) return [];
    return this.handleDbOperation(async () => {
      const rows = await this.db
        .insert(notificationsTable)
        .values(
          dtos.map((dto) => ({
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            data: dto.data,
            isRead: dto.isRead ?? false,
            isPushSent: dto.isPushSent ?? false,
            createdAt: new Date(),
          })),
        )
        .returning();

      this.logger.log(`Bulk created ${rows.length} notifications`);
      return rows.map((r) => new NotificationResponseDto(r));
    }, 'createMany');
  }

  // ─── NOTIFY ALL ADMINS (reusable for restaurant approval etc) ───
  async notifyAdmins(
    payload: Omit<CreateNotificationDto, 'userId'>,
  ): Promise<NotificationResponseDto[]> {
    return this.handleDbOperation(async () => {
      const admins = await this.db
        .select({ id: usersTable.id })
        .from(usersTable)
        .where(
          and(
            eq(usersTable.role, 'ADMIN'),
            sql`${usersTable.deletedAt} IS NULL`,
          ),
        );

      if (!admins.length) {
        this.logger.warn('[notifyAdmins] No admin users found');
        return [];
      }

      const dtos: CreateNotificationDto[] = admins.map((a) => ({
        userId: a.id,
        ...payload,
      }));

      // Use single INSERT for efficiency
      const rows = await this.db
        .insert(notificationsTable)
        .values(
          dtos.map((dto) => ({
            userId: dto.userId,
            type: dto.type,
            title: dto.title,
            body: dto.body,
            data: dto.data,
            isRead: false,
            isPushSent: false,
            createdAt: new Date(),
          })),
        )
        .returning();

      this.logger.log(`Notified ${rows.length} admins: ${payload.title}`);
      return rows.map((r) => new NotificationResponseDto(r));
    }, 'notifyAdmins');
  }
}
