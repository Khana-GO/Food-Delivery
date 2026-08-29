/* eslint-disable prettier/prettier */
import {
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { eq, sql, and, or, ilike, desc, count, asc } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import {
  usersTable,
  type NewUsersTable,
  type UsersTable,
} from '../db/schema/user.schema';
import { UserRole } from '@food_delivery/types';
import * as schema from '../db/schema';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { NotificationsService } from '../notification/notification.service';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly LIST_TTL = 60;
  private readonly ENTITY_TTL = 300;
  private readonly STATS_TTL = 60;
  private readonly DELETED_TTL = 60;

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private configService: ConfigService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly notificationsService: NotificationsService,
    private readonly cache: CacheService,
  ) {}

  private keyList(hash: string) { return `users:list:${hash}`; }
  private keyId(id: string) { return `users:id:${id}`; }
  private keyStats() { return `users:stats:overview`; }
  private keyDeleted(hash: string) { return `users:deleted:${hash}`; }

  private async invalidateUsers(opts: { id?: string } = {}): Promise<void> {
    const ops: Promise<void>[] = [this.cache.delByPattern('users:list:*'), this.cache.delByPattern('users:deleted:*'), this.cache.del(this.keyStats())];
    if (opts.id) ops.push(this.cache.del(this.keyId(opts.id)));
    await Promise.all(ops);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Helper Methods
  // ──────────────────────────────────────────────────────────────────────────

  private handleDatabaseError(error: any, context: string): never {
    this.logger.error(`[${context}] Database error:`, error);

    if (error?.code === '23505') {
      throw new ConflictException(
        'Duplicate entry. This record already exists.',
      );
    }
    if (error?.code === '23503') {
      throw new BadRequestException('Related record not found.');
    }
    if (error?.code === '42P01') {
      throw new InternalServerErrorException('Database table not found.');
    }
    if (error?.code === '42703') {
      throw new InternalServerErrorException('Database column not found.');
    }

    throw new InternalServerErrorException(
      `An error occurred while processing your request. Please try again later.`,
    );
  }

  private extractPublicIdFromUrl(url?: string | null): string | null {
    if (!url) return null;
    try {
      const parts = url.split('/');
      const uploadIndex = parts.indexOf('upload');
      if (uploadIndex === -1) return null;
      const pathParts = parts.slice(uploadIndex + 2);
      const filename = pathParts.join('/');
      return filename.replace(/\.[^/.]+$/, '');
    } catch {
      return null;
    }
  }

  private async handleDbOperation<T>(
    operation: () => Promise<T>,
    context: string,
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.handleDatabaseError(error, context);
    }
  }


  async uploadProfileImage(
  userId: string,
  file: Express.Multer.File,
): Promise<UsersTable> {
  const user = await this.findByIdOrThrow(userId);

  const uploadedImage =
    await this.cloudinaryService.uploadImage(
      file,
      `khanago/users/${userId}`,
    );

  const [updatedUser] = await this.db
    .update(usersTable)
    .set({
      imageUrl: uploadedImage.url,
      imagePublicId: uploadedImage.publicId,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updatedUser) {
    // Database update failed after Cloudinary upload.
    // Remove orphaned Cloudinary image.
    await this.cloudinaryService.deleteImage(
      uploadedImage.publicId,
    );

    throw new InternalServerErrorException(
      'Failed to update profile image',
    );
  }

  // Delete old image AFTER successful database update (handle legacy imageUrl without publicId)
  const oldPublicId = user.imagePublicId || this.extractPublicIdFromUrl(user.imageUrl);
  if (oldPublicId && oldPublicId !== uploadedImage.publicId) {
    await this.cloudinaryService.deleteImage(oldPublicId).catch((e) => {
      this.logger.warn(`Failed to delete old image ${oldPublicId}: ${e?.message}`);
    });
  }

  await this.invalidateUsers({ id: userId });
  // Notify user - profile image updated (non-blocking)
  await this.notificationsService
    .create({
      userId,
      type: 'profile',
      title: 'Profile picture updated',
      body: 'Your profile picture has been updated successfully.',
      data: { imageUrl: uploadedImage.url },
    })
    .catch((err) => this.logger.warn(`Failed to create notification for image upload: ${err?.message}`));

  return updatedUser;
}

  async deleteProfileImage(
  userId: string,
): Promise<UsersTable> {
  const user = await this.findByIdOrThrow(userId);

  if (!user.imageUrl && !user.imagePublicId) {
    throw new BadRequestException('No profile image to delete');
  }

  // Delete from Cloudinary if we have a publicId, otherwise try to extract from URL
  const publicIdToDelete = user.imagePublicId || this.extractPublicIdFromUrl(user.imageUrl);
  if (publicIdToDelete) {
    await this.cloudinaryService.deleteImage(publicIdToDelete).catch((e) => {
      this.logger.warn(`Failed to delete old image ${publicIdToDelete}: ${e?.message}`);
    });
  }

  const [updatedUser] = await this.db
    .update(usersTable)
    .set({
      imageUrl: null,
      imagePublicId: null,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.id, userId))
    .returning();

  if (!updatedUser) {
    throw new InternalServerErrorException(
      'Failed to delete profile image',
    );
  }

  await this.invalidateUsers({ id: userId });
  await this.notificationsService
    .create({
      userId,
      type: 'profile',
      title: 'Profile picture removed',
      body: 'Your profile picture has been removed.',
      data: {},
    })
    .catch((err) => this.logger.warn(`Failed to create notification for image delete: ${err?.message}`));

  return updatedUser;
}

  // ──────────────────────────────────────────────────────────────────────────
  // Auth Service Dependencies
  // ──────────────────────────────────────────────────────────────────────────

  async findByEmail(email: string): Promise<UsersTable | null> {
    return this.handleDbOperation(async () => {
      if (!email || email.trim().length === 0) {
        throw new BadRequestException('Email is required');
      }

      const user = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.email, email.trim().toLowerCase()),
      });

      return user ?? null;
    }, 'findByEmail');
  }

  async findById(id: string): Promise<UsersTable | null> {
    return this.handleDbOperation(async () => {
      if (!id || id.trim().length === 0) {
        throw new BadRequestException('User ID is required');
      }
      // Use cache for admin fetches – fail-open
      const cacheKey = this.keyId(id);
      const cached = await this.cache.get<UsersTable>(cacheKey);
      if (cached !== null) return cached;
      const user = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.id, id),
      });
      if (user) await this.cache.set(cacheKey, user, this.ENTITY_TTL);
      return user ?? null;
    }, 'findById');
  }

  async findByIdOrThrow(id: string): Promise<UsersTable> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByVerificationToken(tokenHash: string): Promise<UsersTable | null> {
    return this.handleDbOperation(async () => {
      if (!tokenHash || tokenHash.trim().length === 0) {
        throw new BadRequestException('Verification token is required');
      }

      const user = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.verificationToken, tokenHash),
      });

      return user ?? null;
    }, 'findByVerificationToken');
  }

  async findByResetToken(tokenHash: string): Promise<UsersTable | null> {
    return this.handleDbOperation(async () => {
      if (!tokenHash || tokenHash.trim().length === 0) {
        throw new BadRequestException('Reset token is required');
      }

      const user = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.resetToken, tokenHash),
      });

      return user ?? null;
    }, 'findByResetToken');
  }

  async create(
    data: NewUsersTable,
    db: Pick<NeonDatabase, 'insert'> = this.db,
  ): Promise<UsersTable> {
    return this.handleDbOperation(async () => {
      if (!data.email || !data.password) {
        throw new BadRequestException('Email and password are required');
      }

      const normalizedPhone = data.phone?.trim();
      if (!normalizedPhone) {
        throw new BadRequestException('Phone number is required');
      }

      const existing = await this.findByEmail(data.email);
      if (existing) {
        throw new ConflictException('Email already registered');
      }

      const existingPhone = await this.db.query.usersTable.findFirst({
        where: eq(usersTable.phone, normalizedPhone),
      });

      if (existingPhone) {
        throw new ConflictException('Phone number already registered');
      }

      const saltRounds =
        Number(this.configService.get<string>('SALT_ROUNDS', '10')) || 10;

      const hashedPassword = await bcrypt.hash(data.password, saltRounds);

      const [newUser] = await db
        .insert(usersTable)
        .values({
          ...data,
          password: hashedPassword,
          phone: normalizedPhone,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!newUser) {
        throw new InternalServerErrorException('Failed to create user');
      }

      await this.invalidateUsers();
      // Notify new user – welcome (non-blocking)
      await this.notificationsService
        .create({
          userId: newUser.id,
          type: 'profile',
          title: 'Welcome to KhanaGo!',
          body: `Your account has been created as ${newUser.role}.`,
          data: { role: newUser.role },
        })
        .catch((err) => this.logger.warn(`Failed to create welcome notification: ${err?.message}`));

      this.logger.log(`User created: ${newUser.email} (ID: ${newUser.id})`);
      return newUser;
    }, 'create');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // UPDATE methods - Fixed the .length check
  // ──────────────────────────────────────────────────────────────────────────

  async markAsVerified(userId: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(userId);

      if (user.isVerified) {
        throw new BadRequestException('User is already verified');
      }

      const result = await this.db
        .update(usersTable)
        .set({
          isVerified: true,
          verificationToken: null,
          verificationAttempts: 0,
          verificationTokenExpiry: null,
          verifiedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();

      //  Check if any row was updated by checking the returned array
      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to verify user');
      }

      await this.invalidateUsers({ id: userId });
      await this.notificationsService
        .create({
          userId,
          type: 'profile',
          title: 'Account Verified',
          body: `Your account has been verified successfully.`,
          data: {},
        })
        .catch((err) => this.logger.warn(`Failed to create verify notification: ${err?.message}`));
      this.logger.log(`User verified: ${user.email} (ID: ${userId})`);
    }, 'markAsVerified');
  }

  async setResetToken(
    userId: string,
    tokenHash: string,
    expiry: Date,
  ): Promise<void> {
    await this.handleDbOperation(async () => {
      await this.findByIdOrThrow(userId);

      const result = await this.db
        .update(usersTable)
        .set({
          resetToken: tokenHash,
          resetTokenExpiry: expiry,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to set reset token');
      }

      this.logger.log(`Reset token set for user: ${userId}`);
    }, 'setResetToken');
  }

  async setVerificationToken(
    id: string,
    tokenHash: string,
    expiry: Date,
  ): Promise<void> {
    await this.handleDbOperation(async () => {
      await this.findByIdOrThrow(id);

      const result = await this.db
        .update(usersTable)
        .set({
          verificationToken: tokenHash,
          verificationTokenExpiry: expiry,
          verificationAttempts: 0,
          verificationLastSentAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Failed to set verification token',
        );
      }

      this.logger.log(`Verification token set for user: ${id}`);
    }, 'setVerificationToken');
  }

  async updatePassword(userId: string, hashedPassword: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await this.findByIdOrThrow(userId);

      const result = await this.db
        .update(usersTable)
        .set({
          password: hashedPassword,
          resetToken: null,
          resetTokenExpiry: null,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to update password');
      }

      this.logger.log(`Password updated for user: ${userId}`);
    }, 'updatePassword');
  }

  async recordLogin(userId: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(userId);

      const result = await this.db
        .update(usersTable)
        .set({
          lastLoginAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to record login');
      }

      this.logger.log(`Login recorded for user: ${user.email}`);
    }, 'recordLogin');
  }

  async incrementVerificationAttempts(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(id);

      if (user.verificationAttempts >= 5) {
        throw new BadRequestException(
          'Too many verification attempts. Please request a new code.',
        );
      }

      const result = await this.db
        .update(usersTable)
        .set({
          verificationAttempts: sql`${usersTable.verificationAttempts} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Failed to increment verification attempts',
        );
      }
    }, 'incrementVerificationAttempts');
  }

  async incrementResetAttempts(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(id);

      if (user.resetAttempts >= 5) {
        throw new BadRequestException(
          'Too many reset attempts. Please try again later.',
        );
      }

      const result = await this.db
        .update(usersTable)
        .set({
          resetAttempts: sql`${usersTable.resetAttempts} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Failed to increment reset attempts',
        );
      }
    }, 'incrementResetAttempts');
  }

  async clearResetToken(id: string): Promise<void> {
    await this.handleDbOperation(async () => {
      await this.findByIdOrThrow(id);

      const result = await this.db
        .update(usersTable)
        .set({
          resetToken: null,
          resetTokenExpiry: null,
          resetAttempts: 0,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to clear reset token');
      }

      this.logger.log(`Reset token cleared for user: ${id}`);
    }, 'clearResetToken');
  }

  // ──────────────────────────────────────────────────────────────────────────
  // Admin CRUD Operations
  // ──────────────────────────────────────────────────────────────────────────

  async findAll(
    options: {
      page?: number;
      limit?: number;
      search?: string;
      role?: UserRole;
      isVerified?: boolean;
      isOnline?: boolean;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    } = {},
  ): Promise<{
    data: UsersTable[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const normalized = {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
      search: options.search ?? '',
      role: options.role ?? '',
      isVerified: options.isVerified,
      isOnline: options.isOnline,
      sortBy: options.sortBy ?? 'createdAt',
      sortOrder: options.sortOrder ?? 'desc',
    };
    const hash = CacheService.hashOptions(normalized);
    const cacheKey = this.keyList(hash);

    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.LIST_TTL, async () => {
        const {
          page = 1,
          limit = 10,
          search,
          role,
          isVerified,
          isOnline,
          sortBy = 'createdAt',
          sortOrder = 'desc',
        } = options;

        if (page < 1) throw new BadRequestException('Page must be at least 1');
        if (limit < 1 || limit > 100) {
          throw new BadRequestException('Limit must be between 1 and 100');
        }

        const allowedSortFields: Record<string, any> = {
          createdAt: usersTable.createdAt,
          updatedAt: usersTable.updatedAt,
          firstName: usersTable.firstName,
          lastName: usersTable.lastName,
          email: usersTable.email,
        };
        const sortColumn = allowedSortFields[sortBy] ?? usersTable.createdAt;
        const orderFn = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const conditions: any[] = [];

        if (search && search.trim().length > 0) {
          const searchTerm = `%${search.trim()}%`;
          conditions.push(
            or(
              ilike(usersTable.firstName, searchTerm),
              ilike(usersTable.lastName, searchTerm),
              ilike(usersTable.email, searchTerm),
              ilike(usersTable.phone, searchTerm),
            ),
          );
        }

        if (role) {
          conditions.push(eq(usersTable.role, role));
        }

        if (isVerified !== undefined) {
          conditions.push(eq(usersTable.isVerified, isVerified));
        }

        if (isOnline !== undefined) {
          conditions.push(eq(usersTable.isOnline, isOnline));
        }

        conditions.push(sql`${usersTable.deletedAt} IS NULL`);

        const whereClause =
          conditions.length > 0 ? and(...conditions) : undefined;

        const [countResult] = await this.db
          .select({ total: count() })
          .from(usersTable)
          .where(whereClause);

        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;

        const users = await this.db
          .select()
          .from(usersTable)
          .where(whereClause)
          .orderBy(orderFn)
          .limit(limit)
          .offset(offset);

        return {
          data: users,
          total,
          page,
          limit,
          totalPages,
        };
      });
    }, 'findAll');
  }

  async update(id: string, data: Partial<NewUsersTable>): Promise<UsersTable> {
    return this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(id);

      const { password, ...safeData } = data;

      // Normalize email to lowercase for consistent comparison
      if (safeData.email) {
        safeData.email = safeData.email.trim().toLowerCase();
        if (safeData.email !== user.email) {
          const existing = await this.findByEmail(safeData.email);
          if (existing) {
            throw new ConflictException('Email already registered');
          }
        }
      }

      // Phone uniqueness check (also handles empty string -> undefined)
      if (safeData.phone !== undefined) {
        const normalizedPhone = (safeData.phone)?.trim();
        if (!normalizedPhone) {
          // Allow clearing phone? Keep as null if empty – but DB requires notNull, so ignore empty
          delete (safeData as any).phone;
        } else {
          if (normalizedPhone !== user.phone) {
            const existingPhone = await this.db.query.usersTable.findFirst({
              where: eq(usersTable.phone, normalizedPhone),
            });
            if (existingPhone) {
              throw new ConflictException('Phone number already registered');
            }
          }
          (safeData as any).phone = normalizedPhone;
        }
      }

      const [updated] = await this.db
        .update(usersTable)
        .set({
          ...safeData,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update user');
      }

      await this.invalidateUsers({ id });
      // Send notification (non-blocking) - profile updated
      await this.notificationsService
        .create({
          userId: id,
          type: 'profile',
          title: 'Profile Updated',
          body: `Your profile information has been updated successfully.`,
          data: { updatedFields: Object.keys(data) },
        })
        .catch((err) => this.logger.warn(`Failed to create profile update notification: ${err?.message}`));

      this.logger.log(`User updated: ${updated.email} (ID: ${id})`);
      return updated;
    }, 'update');
  }

  async changeRole(userId: string, newRole: UserRole, actorId?: string): Promise<UsersTable> {
    return this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(userId);

      if (user.deletedAt) {
        throw new BadRequestException('Cannot change role of a deleted user');
      }

      if (actorId && actorId === userId) {
        throw new BadRequestException('You cannot change your own role');
      }

      if (user.role === newRole) {
        throw new BadRequestException(`User already has role: ${newRole}`);
      }

      if (user.role === 'ADMIN' && newRole !== 'ADMIN') {
        const admins = await this.db
          .select()
          .from(usersTable)
          .where(
            and(
              eq(usersTable.role, 'ADMIN'),
              sql`${usersTable.deletedAt} IS NULL`,
            ),
          );

        if (admins.length <= 1) {
          throw new BadRequestException('Cannot remove the last admin user');
        }
      }

      const [updated] = await this.db
        .update(usersTable)
        .set({
          role: newRole,
          updatedAt: new Date(),
        })
        .where(eq(usersTable.id, userId))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update user role');
      }

      await this.invalidateUsers({ id: userId });
      await this.notificationsService
        .create({
          userId,
          type: 'profile',
          title: 'Role Updated',
          body: `Your role has been changed to ${newRole}.`,
          data: { previousRole: user.role, newRole },
        })
        .catch((err) => this.logger.warn(`Failed to create role notification: ${err?.message}`));
      this.logger.log(
        `User ${userId} role changed from ${user.role} to ${newRole}`,
      );
      return updated;
    }, 'changeRole');
  }

  async softDelete(id: string, actorId?: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(id);

      if (actorId && actorId === id) {
        throw new BadRequestException('You cannot delete your own account');
      }

      if (user.deletedAt) {
        throw new BadRequestException('User is already deleted');
      }

      if (user.role === 'ADMIN') {
        const admins = await this.db
          .select()
          .from(usersTable)
          .where(
            and(
              eq(usersTable.role, 'ADMIN'),
              sql`${usersTable.deletedAt} IS NULL`,
            ),
          );

        if (admins.length <= 1) {
          throw new BadRequestException('Cannot delete the last admin user');
        }
      }

      const result = await this.db
        .update(usersTable)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
          email: sql`${usersTable.email} || '-deleted-' || ${id}`,
          phone: sql`${usersTable.phone} || '-deleted-' || ${id}`,
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException('Failed to delete user');
      }

      await this.invalidateUsers({ id });
      await this.notificationsService
        .create({
          userId: id,
          type: 'profile',
          title: 'Account Deactivated',
          body: `Your account has been deactivated.`,
          data: {},
        })
        .catch((err) => this.logger.warn(`Failed to create delete notification: ${err?.message}`));
      this.logger.log(`User soft deleted: ${user.email} (ID: ${id})`);
    }, 'softDelete');
  }

  async restore(id: string): Promise<UsersTable> {
    return this.handleDbOperation(async () => {
      const user = await this.db.query.usersTable.findFirst({
        where: and(
          eq(usersTable.id, id),
          sql`${usersTable.deletedAt} IS NOT NULL`,
        ),
      });

      if (!user) {
        throw new NotFoundException(
          `User with ID ${id} not found or not deleted`,
        );
      }

      const originalEmail = user.email.replace(/-deleted-.*$/, '');
      const originalPhone = user.phone ? user.phone.replace(/-deleted-.*$/, '') : user.phone;

      // Prevent restoring if email/phone now collides with an active user
      const emailCollision = await this.db.query.usersTable.findFirst({
        where: and(eq(usersTable.email, originalEmail), sql`${usersTable.deletedAt} IS NULL`),
      });
      if (emailCollision) {
        throw new ConflictException('Cannot restore: email already taken by another active user');
      }
      if (originalPhone) {
        const phoneCollision = await this.db.query.usersTable.findFirst({
          where: and(eq(usersTable.phone, originalPhone), sql`${usersTable.deletedAt} IS NULL`),
        });
        if (phoneCollision) {
          throw new ConflictException('Cannot restore: phone already taken by another active user');
        }
      }

      const [restored] = await this.db
        .update(usersTable)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
          email: originalEmail,
          phone: originalPhone,
        })
        .where(eq(usersTable.id, id))
        .returning();

      if (!restored) {
        throw new InternalServerErrorException('Failed to restore user');
      }

      await this.invalidateUsers({ id });
      await this.notificationsService
        .create({
          userId: id,
          type: 'profile',
          title: 'Account Restored',
          body: `Your account has been restored. Welcome back!`,
          data: {},
        })
        .catch((err) => this.logger.warn(`Failed to create restore notification: ${err?.message}`));
      this.logger.log(`User restored: ${restored.email} (ID: ${id})`);
      return restored;
    }, 'restore');
  }

  async hardDelete(id: string, actorId?: string): Promise<void> {
    await this.handleDbOperation(async () => {
      const user = await this.findByIdOrThrow(id);

      if (actorId && actorId === id) {
        throw new BadRequestException('You cannot permanently delete your own account');
      }

      if (user.role === 'ADMIN') {
        const admins = await this.db
          .select()
          .from(usersTable)
          .where(
            and(
              eq(usersTable.role, 'ADMIN'),
              sql`${usersTable.deletedAt} IS NULL`,
            ),
          );

        if (admins.length <= 1) {
          throw new BadRequestException('Cannot delete the last admin user');
        }
      }

      const result = await this.db
        .delete(usersTable)
        .where(eq(usersTable.id, id))
        .returning();

      if (!result || result.length === 0) {
        throw new InternalServerErrorException(
          'Failed to permanently delete user',
        );
      }

      await this.invalidateUsers({ id });
      this.logger.log(`User hard deleted: ${user.email} (ID: ${id})`);
    }, 'hardDelete');
  }

  async findDeleted(options: { page?: number; limit?: number; search?: string } = {}): Promise<{
    data: UsersTable[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const hash = CacheService.hashOptions(options);
    const cacheKey = this.keyDeleted(hash);
    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.DELETED_TTL, async () => {
        const { page = 1, limit = 10, search } = options;
        const conditions: any[] = [sql`${usersTable.deletedAt} IS NOT NULL`];
        if (search && search.trim().length > 0) {
          const term = `%${search.trim()}%`;
          conditions.push(or(ilike(usersTable.email, term), ilike(usersTable.firstName, term), ilike(usersTable.lastName, term)));
        }
        const whereClause = and(...conditions);
        const [countResult] = await this.db.select({ total: count() }).from(usersTable).where(whereClause);
        const total = countResult?.total || 0;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const users = await this.db.query.usersTable.findMany({
          where: whereClause,
          orderBy: [desc(usersTable.deletedAt)],
          limit,
          offset,
        });
        return { data: users || [], total, page, limit, totalPages };
      });
    }, 'findDeleted');
  }

  // Backwards compatible: returns just array if needed internally
  async findDeletedLegacy(): Promise<UsersTable[]> {
    const res = await this.findDeleted({ page: 1, limit: 100 });
    return res.data;
  }

  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    onlineUsers: number;
    adminUsers: number;
    deletedUsers: number;
  }> {
    const cacheKey = this.keyStats();
    return this.handleDbOperation(async () => {
      return this.cache.wrap(cacheKey, this.STATS_TTL, async () => {
        const [totalUsersResult] = await this.db
          .select({ totalUsers: count() })
          .from(usersTable);

        const [activeUsersResult] = await this.db
          .select({ activeUsers: count() })
          .from(usersTable)
          .where(sql`${usersTable.deletedAt} IS NULL`);

        const [verifiedUsersResult] = await this.db
          .select({ verifiedUsers: count() })
          .from(usersTable)
          .where(and(eq(usersTable.isVerified, true), sql`${usersTable.deletedAt} IS NULL`));

        const [onlineUsersResult] = await this.db
          .select({ onlineUsers: count() })
          .from(usersTable)
          .where(and(eq(usersTable.isOnline, true), sql`${usersTable.deletedAt} IS NULL`));

        const [adminUsersResult] = await this.db
          .select({ adminUsers: count() })
          .from(usersTable)
          .where(and(eq(usersTable.role, 'ADMIN'), sql`${usersTable.deletedAt} IS NULL`));

        const [deletedUsersResult] = await this.db
          .select({ deletedUsers: count() })
          .from(usersTable)
          .where(sql`${usersTable.deletedAt} IS NOT NULL`);

        return {
          totalUsers: totalUsersResult?.totalUsers ?? 0,
          activeUsers: activeUsersResult?.activeUsers ?? 0,
          verifiedUsers: verifiedUsersResult?.verifiedUsers ?? 0,
          onlineUsers: onlineUsersResult?.onlineUsers ?? 0,
          adminUsers: adminUsersResult?.adminUsers ?? 0,
          deletedUsers: deletedUsersResult?.deletedUsers ?? 0,
        };
      });
    }, 'getStatistics');
  }
}
