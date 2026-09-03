import { DynamicTool } from '@langchain/core/tools';
import { Injectable, Inject } from '@nestjs/common';
import { MenuItemsService } from '../menu/menu.service';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import * as schema from '../db/schema';
import { ilike, or, and, eq } from 'drizzle-orm';
import { menuItemsTable, restaurantsTable } from '../db/schema';
import { isNull } from 'drizzle-orm';

@Injectable()
export class MenuTools {
  constructor(
    private readonly menuItemsService: MenuItemsService,
    @Inject(DATABASE) private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── GET MENU ITEMS ───
  getMenuItemsTool() {
    return new DynamicTool({
      name: 'get_menu_items',
      description:
        'Get all menu items for a restaurant by restaurant ID. Returns items grouped by category.',
      func: async (restaurantId: string) => {
        try {
          const id = restaurantId.trim().replace(/^["']|["']$/g, '');
          const grouped: any =
            await this.menuItemsService.getGroupedByCategory(id);
          return JSON.stringify({
            categories: grouped.map((group: any) => ({
              categoryId: group.categoryId,
              categoryName:
                group.categoryName || group.categoryId || 'Category',
              items: group.items.map((item: any) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                isAvailable: item.isAvailable,
              })),
            })),
          });
        } catch (error) {
          return JSON.stringify({ error: 'Failed to get menu items' });
        }
      },
    });
  }

  // ─── GET MENU ITEM DETAILS ───
  getMenuItemDetailsTool() {
    return new DynamicTool({
      name: 'get_menu_item_details',
      description: 'Get detailed information about a specific menu item by ID.',
      func: async (itemId: string) => {
        try {
          const item = await this.menuItemsService.findById(itemId);
          return JSON.stringify({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
          });
        } catch (error) {
          return JSON.stringify({ error: 'Menu item not found' });
        }
      },
    });
  }

  // ─── SEARCH MENU ITEMS ───
  getSearchMenuItemsTool() {
    return new DynamicTool({
      name: 'search_menu_items',
      description:
        'Search for menu items by name or description across all restaurants. Input is a search keyword like "momo", "pizza", "chicken".',
      func: async (query: string) => {
        try {
          const cleaned = query
            .trim()
            .replace(/^["']|["']$/g, '')
            .slice(0, 80);
          if (!cleaned)
            return JSON.stringify({ results: [], message: 'Empty query' });
          const pattern = `%${cleaned}%`;
          const results = await this.db
            .select({
              id: menuItemsTable.id,
              name: menuItemsTable.name,
              description: menuItemsTable.description,
              price: menuItemsTable.price,
              isAvailable: menuItemsTable.isAvailable,
              restaurantId: menuItemsTable.restaurantId,
              restaurantName: restaurantsTable.name,
            })
            .from(menuItemsTable)
            .innerJoin(
              restaurantsTable,
              eq(menuItemsTable.restaurantId, restaurantsTable.id),
            )
            .where(
              and(
                or(
                  ilike(menuItemsTable.name, pattern),
                  ilike(menuItemsTable.description, pattern),
                ),
                eq(menuItemsTable.isAvailable, true),
                eq(restaurantsTable.isActive, true),
                isNull(restaurantsTable.deletedAt),
              ),
            )
            .limit(10);
          if (!results.length) {
            return JSON.stringify({
              results: [],
              message: `No menu items found for "${cleaned}"`,
            });
          }
          return JSON.stringify({
            count: results.length,
            results: results.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              price: r.price,
              isAvailable: r.isAvailable,
              restaurantId: r.restaurantId,
              restaurantName: r.restaurantName,
            })),
          });
        } catch (error) {
          return JSON.stringify({ error: 'Failed to search menu items' });
        }
      },
    });
  }
}
