import { BaseRepository } from './BaseRepository.js';

export class CartRepository extends BaseRepository {
  constructor() {
    super('Cart', [], 'cartId');
  }

  async getOrCreateCart(cartId = 'default_user_cart') {
    let cart = await this.findById(cartId);
    if (!cart) {
      cart = await this.create({
        cartId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalSavings: 0,
        pincode: null
      });
    }
    return cart;
  }

  async saveCart(cart) {
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mrpTotal = cart.items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const totalSavings = Math.max(0, mrpTotal - subtotal);
    const updated = {
      ...cart,
      totalItems,
      subtotal,
      totalSavings,
      updatedAt: new Date().toISOString()
    };
    return this.update(cart.cartId, updated);
  }
  async clearCart(cartId) {
    return this.update(cartId, {
      items: [],
      totalItems: 0,
      subtotal: 0,
      totalSavings: 0
    });
  }
}
