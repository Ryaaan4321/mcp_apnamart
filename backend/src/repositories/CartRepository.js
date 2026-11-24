import { prisma } from '../db/prisma.js';

export class CartRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async getOrCreateCart(cartId = 'default_user_cart') {
    return this.prisma.cart.upsert({
      where: { cartId },
      update: {},
      create: {
        cartId,
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalSavings: 0,
        pincode: null
      }
    });
  }

  async saveCart(cart) {
    const items = cart.items || [];
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const mrpTotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const totalSavings = Math.max(0, mrpTotal - subtotal);

    return this.prisma.cart.update({
      where: { cartId: cart.cartId },
      data: {
        items: items,
        totalItems,
        subtotal,
        totalSavings,
        pincode: cart.pincode || null
      }
    });
  }

  async clearCart(cartId) {
    return this.prisma.cart.update({
      where: { cartId },
      data: {
        items: [],
        totalItems: 0,
        subtotal: 0,
        totalSavings: 0
      }
    });
  }

  async delete(cartId) {
    return this.prisma.cart.delete({
      where: { cartId }
    }).catch(() => null);
  }
}
