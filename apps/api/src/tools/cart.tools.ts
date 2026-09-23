/* eslint-disable no-empty */
import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { CartService } from '../cart/cart.service';

export const cartContext = new AsyncLocalStorage<{ userId: string }>();

@Injectable()
export class CartTools {
  constructor(private readonly cartService: CartService) {}

  // Legacy setter kept for compatibility
  setCurrentUserId(_userId: string) {}

  // ─── GET USER CART ───
  getUserCartTool() {
    return new DynamicStructuredTool({
      name: 'get_user_cart',
      description:
        "Get the user's current shopping cart, including restaurant name, items, quantities, unit prices, subtotal, and delivery fee.",
      schema: z.object({}),
      func: async () => {
        try {
          const currentUserId = cartContext.getStore()?.userId;
          if (!currentUserId) {
            return JSON.stringify({
              error: 'User not authenticated or user ID missing.',
            });
          }

          const cart = await this.cartService.getCart(currentUserId);
          if (!cart || !cart.items || cart.items.length === 0) {
            return JSON.stringify({
              message: 'Your cart is currently empty.',
              itemCount: 0,
              items: [],
            });
          }

          const deliveryFee = cart.deliveryFee ?? 0;
          return JSON.stringify({
            cartId: cart.cartId,
            restaurantName: cart.restaurantName || 'Restaurant',
            isOpen: cart.restaurantIsOpen,
            totalItems: cart.totalItems,
            subtotal: cart.subtotal,
            deliveryFee,
            estimatedTotal:
              Math.round((cart.subtotal + deliveryFee) * 100) / 100,
            items: cart.items.map((i) => ({
              name: i.name,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
              isAvailable: i.isAvailable,
            })),
          });
        } catch (error: any) {
          return JSON.stringify({
            error:
              'Failed to retrieve cart: ' +
              (error?.message || 'unknown error'),
          });
        }
      },
    });
  }

  // ─── CLEAR USER CART ───
  getClearCartTool() {
    return new DynamicStructuredTool({
      name: 'clear_user_cart',
      description:
        "Clear all items from the user's active shopping cart.",
      schema: z.object({}),
      func: async () => {
        try {
          const currentUserId = cartContext.getStore()?.userId;
          if (!currentUserId) {
            return JSON.stringify({
              error: 'User not authenticated or user ID missing.',
            });
          }

          await this.cartService.clearCart(currentUserId);
          return JSON.stringify({
            success: true,
            message: 'Your cart has been cleared.',
          });
        } catch (error: any) {
          return JSON.stringify({
            error:
              'Failed to clear cart: ' +
              (error?.message || 'unknown error'),
          });
        }
      },
    });
  }
}
