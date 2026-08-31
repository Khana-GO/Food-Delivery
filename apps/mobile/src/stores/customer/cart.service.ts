import { api } from "@/lib/axios";


export const cartService = {
  // ─── Get backend cart ───
  getCart: async (): Promise<any> => {
    const response = await api.get('/cart');
    return response.data;
  },

  // ─── Add item ───
  addItem: async (menuItemId: string, quantity: number = 1): Promise<any> => {
    const response = await api.post('/cart/items', { menuItemId, quantity });
    return response.data;
  },

  // ─── Update item quantity ───
  updateItem: async (menuItemId: string, quantity: number): Promise<any> => {
    const response = await api.put('/cart/items', { menuItemId, quantity });
    return response.data;
  },

  // ─── Remove item ───
  removeItem: async (menuItemId: string): Promise<any> => {
    const response = await api.delete(`/cart/items/${menuItemId}`);
    return response.data;
  },

  // ─── Clear cart ───
  clearCart: async (): Promise<any> => {
    const response = await api.delete('/cart');
    return response.data;
  },

  // ─── Merge guest cart ───
  mergeCart: async (items: any[], restaurantId: string): Promise<any> => {
    const response = await api.post('/cart/merge', { items, restaurantId });
    return response.data;
  },
};