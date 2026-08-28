// apps/api/src/notifications/notifications.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
  ApiQuery,
} from '@nestjs/swagger';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { NotificationResponseDto } from './dto/notification-response.dto';
import { NotificationPaginationDto } from './dto/notification-pagination.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@food_delivery/types';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notification.service';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ─── CREATE NOTIFICATION (internal, used by services) ───
  // This can be exposed only for admin or kept internal.
  // For simplicity, we'll keep it but restrict to admin.

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a notification (Admin only)' })
  @ApiResponse({ status: 201, type: NotificationResponseDto })
  async create(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.create(dto);
  }

  // ─── GET MY NOTIFICATIONS ───
  @Get()
  @ApiOperation({ summary: 'Get current user notifications' })
  @ApiResponse({ status: 200, description: 'List of notifications' })
  async getMyNotifications(
    @CurrentUser() user: JwtPayload,
    @Query() pagination: NotificationPaginationDto,
  ) {
    return this.notificationsService.findByUser(user.sub, pagination);
  }

  // ─── GET UNREAD COUNT ───
  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  @ApiResponse({ status: 200, description: 'Unread count' })
  async getUnreadCount(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ count: number }> {
    return this.notificationsService.getUnreadCount(user.sub);
  }

  // ─── MARK AS READ ───
  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, type: NotificationResponseDto })
  async markAsRead(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<NotificationResponseDto> {
    return this.notificationsService.markAsRead(id, user.sub);
  }

  // ─── MARK ALL AS READ ───
  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All marked read' })
  async markAllAsRead(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; count: number }> {
    return this.notificationsService.markAllAsRead(user.sub);
  }

  // ─── DELETE NOTIFICATION ───
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async delete(
    @Param('id', new ParseUUIDPipe()) id: string,
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string }> {
    return this.notificationsService.delete(id, user.sub);
  }

  // ─── DELETE ALL (optional) ───
  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete all notifications' })
  @ApiResponse({ status: 200, description: 'All notifications deleted' })
  async deleteAll(
    @CurrentUser() user: JwtPayload,
  ): Promise<{ message: string; count: number }> {
    return this.notificationsService.deleteAll(user.sub);
  }
}
