import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql, desc, ilike } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { MenuItemResponseDto } from './dto/menu-item-response.dto';
import * as schema from '../db/schema';
import { CloudinaryService } from '../cloudinary/clodinary.service';
import { CreateMenuItemDto } from './dto/create-menu.dto';

@Injectable()
export class MenuItemsService {
  private readonly logger = new Logger(MenuItemsService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
    private readonly cloudinaryService: CloudinaryService,
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

  private extractPublicId(url: string): string | null {
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

  // ─── CREATE ───
  async create(
    restaurantId: string,
    dto: CreateMenuItemDto,
    file?: Express.Multer.File,
  ): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      // Upload image if provided
      let imageUrl: string | undefined;

      if (file) {
        const result = await this.cloudinaryService.uploadImage(
          file,
          `khanago/menu-items/${restaurantId}`,
        );
        imageUrl = result.url;
      }

      const [item] = await this.db
        .insert(schema.menuItemsTable)
        .values({
          restaurantId,
          categoryId: dto.categoryId,
          name: dto.name,
          description: dto.description,
          price: dto.price.toString(),
          imageUrl: imageUrl || dto.imageUrl,
          isAvailable: dto.isAvailable ?? true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (!item) {
        throw new InternalServerErrorException('Failed to create menu item');
      }

      this.logger.log(`Menu item created: ${item.name} (ID: ${item.id})`);
      return new MenuItemResponseDto(item);
    }, 'create');
  }

  // ─── FIND ALL (By Restaurant) ───
  async findByRestaurant(
    restaurantId: string,
    options: {
      page?: number;
      limit?: number;
      search?: string;
      categoryId?: string;
      isAvailable?: boolean;
      sortBy?: string;
      sortOrder?: 'ASC' | 'DESC';
    } = {},
  ): Promise<{
    data: MenuItemResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.handleDbOperation(async () => {
      const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        isAvailable,
        sortBy = 'createdAt',
        sortOrder = 'DESC',
      } = options;

      const conditions: any[] = [
        eq(schema.menuItemsTable.restaurantId, restaurantId),
        sql`${schema.menuItemsTable.deletedAt} IS NULL`,
      ];

      if (search) {
        const searchTerm = `%${search}%`;
        conditions.push(
          sql`${menuItemsTable.name} ILIKE ${searchTerm} OR ${menuItemsTable.description} ILIKE ${searchTerm}`,
        );
      }

      if (categoryId) {
        conditions.push(eq(menuItemsTable.categoryId, categoryId));
      }

      if (isAvailable !== undefined) {
        conditions.push(eq(menuItemsTable.isAvailable, isAvailable));
      }

      const whereClause =
        conditions.length > 0 ? and(...conditions) : undefined;

      const [countResult] = await this.db
        .select({ total: sql<number>`count(*)` })
        .from(menuItemsTable)
        .where(whereClause);

      const total = countResult?.total || 0;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;

      const items = await this.db
        .select()
        .from(menuItemsTable)
        .where(whereClause)
        .orderBy(
          sql`${menuItemsTable[sortBy as keyof typeof menuItemsTable]} ${sql.raw(sortOrder)}`,
        )
        .limit(limit)
        .offset(offset);

      return {
        data: items.map((item) => new MenuItemResponseDto(item)),
        total,
        page,
        limit,
        totalPages,
      };
    }, 'findByRestaurant');
  }

  // ─── FIND ALL (By Category) ───
  async findByCategory(
    categoryId: string,
    isAvailable?: boolean,
  ): Promise<MenuItemResponseDto[]> {
    return this.handleDbOperation(async () => {
      const conditions: any[] = [
        eq(menuItemsTable.categoryId, categoryId),
        sql`${menuItemsTable.deletedAt} IS NULL`,
      ];

      if (isAvailable !== undefined) {
        conditions.push(eq(menuItemsTable.isAvailable, isAvailable));
      }

      const items = await this.db
        .select()
        .from(menuItemsTable)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(desc(menuItemsTable.createdAt));

      return items.map((item) => new MenuItemResponseDto(item));
    }, 'findByCategory');
  }

  // ─── FIND BY ID ───
  async findById(id: string): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      const item = await this.db.query.menuItemsTable.findFirst({
        where: and(
          eq(menuItemsTable.id, id),
          sql`${menuItemsTable.deletedAt} IS NULL`,
        ),
      });

      if (!item) {
        throw new NotFoundException(`Menu item with ID ${id} not found`);
      }

      return new MenuItemResponseDto(item);
    }, 'findById');
  }

  // ─── UPDATE ───
  async update(
    id: string,
    dto: UpdateMenuItemDto,
    file?: Express.Multer.File,
  ): Promise<MenuItemResponseDto> {
    return this.handleDbOperation(async () => {
      const existing = await this.findById(id);

      let imageUrl = existing.imageUrl;

      if (file) {
        // Delete old image if exists
        if (existing.imageUrl) {
          const publicId = this.extractPublicId(existing.imageUrl);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        }
        const result = await this.cloudinaryService.uploadImage(
          file,
          `khanago/menu-items/${existing.restaurantId}`,
        );
        imageUrl = result.url;
      }

      const updateData: Partial<NewMenuItem> = {
        ...dto,
        price: dto.price?.toString(),
        imageUrl: file ? imageUrl : dto.imageUrl,
        updatedAt: new Date(),
      };

      const [updated] = await this.db
        .update(menuItemsTable)
        .set(updateData)
        .where(eq(menuItemsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to update menu item');
      }

      this.logger.log(`Menu item updated: ${updated.name} (ID: ${id})`);
      return new MenuItemResponseDto(updated);
    }, 'update');
  }

  // ─── TOGGLE AVAILABILITY ───
  async toggleAvailability(id: string): Promise<{ isAvailable: boolean }> {
    return this.handleDbOperation(async () => {
      const item = await this.findById(id);

      const [updated] = await this.db
        .update(menuItemsTable)
        .set({
          isAvailable: !item.isAvailable,
          updatedAt: new Date(),
        })
        .where(eq(menuItemsTable.id, id))
        .returning();

      if (!updated) {
        throw new InternalServerErrorException('Failed to toggle availability');
      }

      this.logger.log(`Menu item ${id} availability: ${updated.isAvailable}`);
      return { isAvailable: updated.isAvailable };
    }, 'toggleAvailability');
  }

  // ─── DELETE ───
  async delete(id: string): Promise<{ message: string }> {
    return this.handleDbOperation(async () => {
      const item = await this.findById(id);

      // Delete image from Cloudinary if exists
      if (item.imageUrl) {
        const publicId = this.extractPublicId(item.imageUrl);
        if (publicId) {
          await this.cloudinaryService.deleteImage(publicId);
        }
      }

      await this.db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));

      this.logger.log(`Menu item deleted: ${item.name} (ID: ${id})`);
      return { message: 'Menu item deleted successfully' };
    }, 'delete');
  }

  // ─── BULK CREATE ───
  async bulkCreate(
    restaurantId: string,
    items: CreateMenuItemDto[],
  ): Promise<MenuItemResponseDto[]> {
    return this.handleDbOperation(async () => {
      const createdItems = [];

      for (const dto of items) {
        const [item] = await this.db
          .insert(menuItemsTable)
          .values({
            restaurantId,
            categoryId: dto.categoryId,
            name: dto.name,
            description: dto.description,
            price: dto.price.toString(),
            imageUrl: dto.imageUrl,
            isAvailable: dto.isAvailable ?? true,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        if (item) {
          createdItems.push(item);
        }
      }

      this.logger.log(
        `Bulk created ${createdItems.length} menu items for restaurant ${restaurantId}`,
      );
      return createdItems.map((item) => new MenuItemResponseDto(item));
    }, 'bulkCreate');
  }

  // ─── BULK DELETE ───
  async bulkDelete(
    ids: string[],
  ): Promise<{ message: string; deleted: number }> {
    return this.handleDbOperation(async () => {
      let deletedCount = 0;

      for (const id of ids) {
        const item = await this.findById(id);
        if (item.imageUrl) {
          const publicId = this.extractPublicId(item.imageUrl);
          if (publicId) {
            await this.cloudinaryService.deleteImage(publicId);
          }
        }
        await this.db.delete(menuItemsTable).where(eq(menuItemsTable.id, id));
        deletedCount++;
      }

      this.logger.log(`Bulk deleted ${deletedCount} menu items`);
      return {
        message: `${deletedCount} menu items deleted successfully`,
        deleted: deletedCount,
      };
    }, 'bulkDelete');
  }

  // ─── GET BY CATEGORIES (Grouped) ───
  async getGroupedByCategory(
    restaurantId: string,
  ): Promise<{ categoryId: string; items: MenuItemResponseDto[] }[]> {
    return this.handleDbOperation(async () => {
      const items = await this.db
        .select()
        .from(menuItemsTable)
        .where(
          and(
            eq(menuItemsTable.restaurantId, restaurantId),
            eq(menuItemsTable.isAvailable, true),
            sql`${menuItemsTable.deletedAt} IS NULL`,
          ),
        )
        .orderBy(desc(menuItemsTable.createdAt));

      // Group by categoryId
      const grouped = items.reduce(
        (acc, item) => {
          const categoryId = item.categoryId;
          if (!acc[categoryId]) {
            acc[categoryId] = [];
          }
          acc[categoryId].push(new MenuItemResponseDto(item));
          return acc;
        },
        {} as Record<string, MenuItemResponseDto[]>,
      );

      return Object.entries(grouped).map(([categoryId, items]) => ({
        categoryId,
        items,
      }));
    }, 'getGroupedByCategory');
  }
}
