import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, sql, desc, isNull } from 'drizzle-orm';
import { NeonDatabase } from 'drizzle-orm/neon-serverless';
import { DATABASE } from '../db/database.constants';
import { cartsTable, type NewCart } from '../db/schema/cart.schema';
import {
  cartItemsTable,
  type NewCartItem,
} from '../db/schema/cart.item.schema';
import { menuItemsTable } from '../db/schema/menu.items.schema';
import { restaurantsTable } from '../db/schema/restaurant.schema';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { CartResponseDto, CartItemDto } from './dto/cart-response.dto';
import * as schema from '../db/schema';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);

  constructor(
    @Inject(DATABASE)
    private readonly db: NeonDatabase<typeof schema>,
  ) {}

  // ─── Get or create cart for user ───
  async getOrCreateCart(
    userId: string,
    restaurantId?: string,
  ): Promise<string> {
    const existing = await this.db.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
    });

    if (existing) {
      if (restaurantId && existing.restaurantId !== restaurantId) {
        throw new ConflictException(
          'Cart contains items from a different restaurant. Clear your cart before adding items from a new restaurant.',
        );
      }
      return existing.id;
    }

    if (!restaurantId) {
      throw new BadRequestException(
        'Restaurant ID required to create new cart',
      );
    }
    return this.createNewCart(userId, restaurantId);
  }

  private async createNewCart(
    userId: string,
    restaurantId: string,
  ): Promise<string> {
    const [cart] = await this.db
      .insert(cartsTable)
      .values({ userId, restaurantId })
      .returning();
    if (!cart) throw new Error('Failed to create cart');
    return cart.id;
  }

  // ─── Get cart with items (joins restaurant for fee/minOrder & validates availability) ───
  async getCart(userId: string): Promise<CartResponseDto | null> {
    const cart = await this.db.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
    });

    if (!cart) return null;

    // Verify cart's restaurant still approved; if not, auto-clear stale cart
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, cart.restaurantId),
    });
    if (
      !restaurant ||
      !restaurant.isVerified ||
      !restaurant.isActive ||
      restaurant.deletedAt
    ) {
      await this.clearCart(userId);
      return null;
    }

    const items = await this.db
      .select({
        cartItem: schema.cartItemsTable,
        menuItem: menuItemsTable,
      })
      .from(schema.cartItemsTable)
      .where(eq(schema.cartItemsTable.cartId, cart.id))
      .innerJoin(
        menuItemsTable,
        eq(schema.cartItemsTable.menuItemId, menuItemsTable.id),
      );

    const cartItems: CartItemDto[] = items.map(
      ({ cartItem, menuItem }) =>
        ({
          menuItemId: cartItem.menuItemId,
          name: menuItem.name,
          quantity: cartItem.quantity,
          unitPrice: parseFloat(cartItem.unitPrice),
          // Re-sync totalPrice if price changed upstream
          totalPrice: cartItem.quantity * parseFloat(menuItem.price),
          imageUrl: menuItem.imageUrl,
          isAvailable: menuItem.isAvailable,
          categoryId: (menuItem as any).categoryId,
          restaurantId: (menuItem as any).restaurantId,
        }) as any,
    );

    const deliveryFee = parseFloat((restaurant as any).deliveryFee || '0');
    const minimumOrder = parseFloat(
      (restaurant as any).minimumOrderAmount || '0',
    );

    // Purge unavailable items automatically and refresh cart (bounded, non-recursive)
    const unavailable = cartItems.filter((i) => !i.isAvailable);
    if (unavailable.length > 0) {
      for (const u of unavailable) {
        await this.db
          .delete(schema.cartItemsTable)
          .where(
            and(
              eq(schema.cartItemsTable.cartId, cart.id),
              eq(schema.cartItemsTable.menuItemId, u.menuItemId),
            ),
          );
      }
      // Rebuild cart without recursion – filter out purged items locally
      const purgedItems = cartItems.filter((i) => i.isAvailable);
      const subtotalPurged = purgedItems.reduce(
        (sum, i) => sum + i.totalPrice,
        0,
      );
      const totalItemsPurged = purgedItems.reduce(
        (sum, i) => sum + i.quantity,
        0,
      );
      return {
        cartId: cart.id,
        restaurantId: cart.restaurantId,
        items: purgedItems,
        subtotal: Math.round(subtotalPurged * 100) / 100,
        totalItems: totalItemsPurged,
        deliveryFee,
        minimumOrderAmount: minimumOrder,
        restaurantName: (restaurant as any).name,
        restaurantIsOpen: (restaurant as any).isOpen,
      };
    }

    const subtotal = cartItems.reduce((sum, i) => sum + i.totalPrice, 0);
    const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0);

    return {
      cartId: cart.id,
      restaurantId: cart.restaurantId,
      items: cartItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
      deliveryFee,
      minimumOrderAmount: minimumOrder,
      restaurantName: (restaurant as any).name,
      restaurantIsOpen: (restaurant as any).isOpen,
    };
  }

  // ─── Add item to cart (with approved restaurant check + qty cap) ───
  async addItem(userId: string, dto: AddToCartDto): Promise<CartResponseDto> {
    if (dto.quantity < 1 || dto.quantity > 10) {
      throw new BadRequestException('Quantity must be between 1 and 10');
    }
    // 1. Get menu item + restaurant to validate availability & approval
    const menuItem = await this.db.query.menuItemsTable.findFirst({
      where: eq(menuItemsTable.id, dto.menuItemId),
    });
    if (!menuItem) throw new NotFoundException('Menu item not found');
    if (!menuItem.isAvailable)
      throw new BadRequestException('Item is currently unavailable');

    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, menuItem.restaurantId),
    });
    if (
      !restaurant ||
      !restaurant.isVerified ||
      !restaurant.isActive ||
      restaurant.deletedAt
    ) {
      throw new BadRequestException('Restaurant is not available for ordering');
    }
    if (restaurant.isOpen === false) {
      throw new BadRequestException('Restaurant is currently closed');
    }

    // 2. Get or create cart (assumes the restaurant ID is from menu item)
    const restaurantId = menuItem.restaurantId;
    const cartId = await this.getOrCreateCart(userId, restaurantId);

    // 3. Check if item already in cart
    const existingItem = await this.db.query.cartItemsTable.findFirst({
      where: and(
        eq(schema.cartItemsTable.cartId, cartId),
        eq(schema.cartItemsTable.menuItemId, dto.menuItemId),
      ),
    });

    if (existingItem) {
      const newQty = existingItem.quantity + dto.quantity;
      if (newQty > 10) throw new BadRequestException('Max 10 units per item');
      const totalPrice = newQty * parseFloat(menuItem.price);
      await this.db
        .update(schema.cartItemsTable)
        .set({
          quantity: newQty,
          unitPrice: menuItem.price, // keep price fresh
          totalPrice: totalPrice.toString(),
          updatedAt: new Date(),
        })
        .where(eq(schema.cartItemsTable.id, existingItem.id));
    } else {
      const newItem: NewCartItem = {
        cartId,
        menuItemId: dto.menuItemId,
        quantity: dto.quantity,
        unitPrice: menuItem.price,
        totalPrice: (dto.quantity * parseFloat(menuItem.price)).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.db.insert(schema.cartItemsTable).values(newItem);
    }

    // Update cart timestamp
    await this.db
      .update(schema.cartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(cartsTable.id, cartId));

    return (await this.getCart(userId)) as CartResponseDto;
  }

  // ─── Update item quantity (0 to remove) ───
  async updateItem(
    userId: string,
    dto: UpdateCartItemDto,
  ): Promise<CartResponseDto | null> {
    if (dto.quantity < 0 || dto.quantity > 10) {
      throw new BadRequestException('Quantity must be between 0 and 10');
    }
    if (dto.quantity > 0 && dto.quantity < 1) {
      throw new BadRequestException(
        'Quantity must be at least 1 or 0 to remove',
      );
    }
    const cart = await this.db.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    if (dto.quantity === 0) {
      // Remove item
      await this.db
        .delete(schema.cartItemsTable)
        .where(
          and(
            eq(schema.cartItemsTable.cartId, cart.id),
            eq(schema.cartItemsTable.menuItemId, dto.menuItemId),
          ),
        );
    } else {
      // Update quantity – recalc totalPrice
      const menuItem = await this.db.query.menuItemsTable.findFirst({
        where: eq(menuItemsTable.id, dto.menuItemId),
      });
      if (!menuItem) throw new NotFoundException('Menu item not found');

      const totalPrice = dto.quantity * parseFloat(menuItem.price);
      await this.db
        .update(schema.cartItemsTable)

        .set({
          quantity: dto.quantity,
          totalPrice: totalPrice.toString(),
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(schema.cartItemsTable.cartId, cart.id),
            eq(schema.cartItemsTable.menuItemId, dto.menuItemId),
          ),
        );
    }

    // Update cart timestamp
    await this.db
      .update(cartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id));

    return this.getCart(userId);
  }

  // ─── Remove item completely ───
  async removeItem(
    userId: string,
    menuItemId: string,
  ): Promise<CartResponseDto | null> {
    const cart = await this.db.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
    });
    if (!cart) throw new NotFoundException('Cart not found');

    await this.db
      .delete(schema.cartItemsTable)
      .where(
        and(
          eq(schema.cartItemsTable.cartId, cart.id),
          eq(schema.cartItemsTable.menuItemId, menuItemId),
        ),
      );

    await this.db
      .update(cartsTable)
      .set({ updatedAt: new Date() })
      .where(eq(cartsTable.id, cart.id));

    return this.getCart(userId);
  }

  // ─── Clear entire cart ───
  async clearCart(userId: string): Promise<void> {
    const cart = await this.db.query.cartsTable.findFirst({
      where: eq(cartsTable.userId, userId),
    });
    if (!cart) return;

    await this.db
      .delete(schema.cartItemsTable)
      .where(eq(schema.cartItemsTable.cartId, cart.id));

    await this.db.delete(cartsTable).where(eq(cartsTable.id, cart.id));
  }

  // ─── Merge guest cart (for login) ───
  async mergeCart(
    userId: string,
    guestItems: CartItemDto[],
    restaurantId: string,
  ): Promise<CartResponseDto | null> {
    // Validate restaurant exists & is orderable
    const restaurant = await this.db.query.restaurantsTable.findFirst({
      where: eq(restaurantsTable.id, restaurantId),
    });
    if (
      !restaurant ||
      !restaurant.isVerified ||
      !restaurant.isActive ||
      restaurant.deletedAt
    ) {
      throw new BadRequestException('Restaurant is not available for ordering');
    }

    // Clear existing cart if any
    await this.clearCart(userId);

    // Create new cart
    const cartId = await this.getOrCreateCart(userId, restaurantId);

    // Insert each item with validation
    for (const item of guestItems) {
      if (!item.quantity || item.quantity < 1 || item.quantity > 10) continue;
      const menuItem = await this.db.query.menuItemsTable.findFirst({
        where: eq(menuItemsTable.id, item.menuItemId),
      });
      if (!menuItem || !menuItem.isAvailable) continue;
      if (menuItem.restaurantId !== restaurantId) continue;

      const newItem: NewCartItem = {
        cartId,
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        unitPrice: menuItem.price,
        totalPrice: (item.quantity * parseFloat(menuItem.price)).toString(),
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await this.db.insert(schema.cartItemsTable).values(newItem);
    }

    return this.getCart(userId);
  }
}
