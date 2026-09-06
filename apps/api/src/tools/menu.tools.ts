import { DynamicTool } from '@langchain/core/tools';
import { Injectable, Inject } from '@nestjs/common';
import { MenuItemsService } from '../menu/menu.service';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import * as schema from '../db/schema';
import { ilike, or, and, eq, isNull } from 'drizzle-orm';
import { menuItemsTable, restaurantsTable } from '../db/schema';

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
        'Get all menu items for a restaurant by restaurant ID or restaurant name. Returns items grouped by category.',
      func: async (input: string) => {
        try {
          const restaurantId = await this.resolveRestaurantId(input);
          if (!restaurantId) {
            return JSON.stringify({
              error:
                'Restaurant not found. Please provide a valid restaurant name or ID.',
            });
          }

          const grouped: any =
            await this.menuItemsService.getGroupedByCategory(restaurantId);
          return JSON.stringify({
            restaurantId,
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
      func: async (input: string) => {
        try {
          const itemId = this.extractQuery(input);
          const item = await this.menuItemsService.findById(itemId);
          return JSON.stringify({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            isAvailable: item.isAvailable,
            categoryId: item.categoryId,
            restaurantId: item.restaurantId,
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
        'Search for menu items by name or description across all restaurants. Input is a search keyword like "momo", "pizza", "chiya".',
      func: async (input: string) => {
        try {
          let cleaned = this.extractQuery(input);
          // Strip conversational noise if the tool caller passed a sentence
          cleaned = cleaned
            .replace(
              /^(can you\s+)?(find|search|show|get|bring|order|i want to eat|i want|where can i get|do you have)\s+(me\s+)?(some\s+)?/i,
              '',
            )
            .replace(/\s+(near me|please|available)$/i, '')
            .trim()
            .slice(0, 80);

          if (!cleaned || cleaned.length < 2) {
            return JSON.stringify({
              results: [],
              message:
                'Search query too short. Please provide a food name like momo, pizza, or tea.',
            });
          }

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
              isOpen: restaurantsTable.isOpen,
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
              message: `No menu items found matching "${cleaned}".`,
            });
          }

          return JSON.stringify({
            count: results.length,
            query: cleaned,
            results: results.map((r) => ({
              id: r.id,
              name: r.name,
              description: r.description,
              price: r.price,
              isAvailable: r.isAvailable,
              restaurantId: r.restaurantId,
              restaurantName: r.restaurantName,
              isOpen: r.isOpen,
            })),
          });
        } catch (error) {
          return JSON.stringify({ error: 'Failed to search menu items' });
        }
      },
    });
  }

  private extractQuery(input: string): string {
    if (!input) return '';
    try {
      const parsed = JSON.parse(input);
      if (typeof parsed === 'string') return parsed.trim();
      if (parsed?.query) return String(parsed.query).trim();
      if (parsed?.keyword) return String(parsed.keyword).trim();
      if (parsed?.search) return String(parsed.search).trim();
      if (parsed?.item) return String(parsed.item).trim();
      if (parsed?.dish) return String(parsed.dish).trim();
      if (parsed?.restaurantId) return String(parsed.restaurantId).trim();
      if (parsed?.id) return String(parsed.id).trim();
      if (parsed?.name) return String(parsed.name).trim();
    } catch {
      /* empty */
    }
    return input.trim().replace(/^["']|["']$/g, '');
  }

  private async resolveRestaurantId(input: string): Promise<string | null> {
    const clean = this.extractQuery(input);
    const uuidRegex =
      /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/;
    const match = clean.match(uuidRegex);
    if (match) return match[0];

    // Try name lookup in DB
    try {
      const matched = await this.db
        .select({ id: restaurantsTable.id })
        .from(restaurantsTable)
        .where(
          and(
            ilike(restaurantsTable.name, `%${clean}%`),
            eq(restaurantsTable.isActive, true),
            isNull(restaurantsTable.deletedAt),
          ),
        )
        .limit(1);

      if (matched.length > 0) return matched[0].id;
    } catch {
      /* empty */
    }

    return null;
  }
}
