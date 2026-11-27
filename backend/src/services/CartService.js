import { Logger } from '../logger/Logger.js';
import { BadRequestError } from '../errors/index.js';

export class CartService {
  constructor(cartRepository, productService, logger = null) {
    this.cartRepository = cartRepository;
    this.productService = productService;
    this.logger = logger ? logger.forContext('CartService') : new Logger('CartService');
  }

  async getCart(cartId = 'default_user_cart') {
    this.logger.debug(`Retrieving cart: ${cartId}`);
    const cart = await this.cartRepository.getOrCreateCart(cartId);
    return {
      ...cart,
      items: (cart.items || []).map(item => ({
        ...item,
        imageUrl: item.imageUrl ?? null,
        thumbnailUrl: item.thumbnailUrl ?? null
      }))
    };
  }

  async addItem(cartId = 'default_user_cart', productId, quantity = 1) {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than zero');
    }

    this.logger.info(`Adding item ${productId} (qty: ${quantity}) to cart ${cartId}`);
    const product = await this.productService.getProductById(productId);

    if (!product.isAvailable || product.stock < quantity) {
      throw new BadRequestError(`Cannot add to cart. Only ${product.stock} items in stock for "${product.name}".`);
    }

    const cart = await this.cartRepository.getOrCreateCart(cartId);
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      const newQty = cart.items[existingItemIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new BadRequestError(`Cannot add ${quantity} more. Stock limit of ${product.stock} reached.`);
      }
      cart.items[existingItemIndex].quantity = newQty;
      cart.items[existingItemIndex].totalPrice = newQty * product.apnaMartPrice;
      cart.items[existingItemIndex].imageUrl = product.imageUrl ?? null;
      cart.items[existingItemIndex].thumbnailUrl = product.thumbnailUrl ?? null;
    } else {
      cart.items.push({
        productId: product.id,
        name: product.name,
        price: product.apnaMartPrice,
        mrp: product.mrp,
        unit: product.unit,
        quantity: quantity,
        totalPrice: product.apnaMartPrice * quantity,
        imageUrl: product.imageUrl ?? null,
        thumbnailUrl: product.thumbnailUrl ?? null
      });
    }

    const updatedCart = await this.cartRepository.saveCart(cart);
    this.logger.info(`Cart ${cartId} updated. Total items: ${updatedCart.totalItems}, Subtotal: ₹${updatedCart.subtotal}`);
    return updatedCart;
  }

  async removeItem(cartId = 'default_user_cart', productId) {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }
    this.logger.info(`Removing item ${productId} from cart ${cartId}`);
    const cart = await this.cartRepository.getOrCreateCart(cartId);
    cart.items = cart.items.filter(item => item.productId !== productId);
    return this.cartRepository.saveCart(cart);
  }

  async updateItem(cartId = 'default_user_cart', productId, quantity) {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }
    if (!Number.isInteger(quantity) || quantity < 0) {
      throw new BadRequestError('Quantity must be a non-negative integer');
    }
    if (quantity === 0) {
      return this.removeItem(cartId, productId);
    }

    const product = await this.productService.getProductById(productId);
    if (!product.isAvailable || product.stock < quantity) {
      throw new BadRequestError(`Only ${product.stock} items in stock for "${product.name}".`);
    }

    const cart = await this.cartRepository.getOrCreateCart(cartId);
    const existingIndex = cart.items.findIndex(item => item.productId === productId);
    if (existingIndex === -1) {
      return this.addItem(cartId, productId, quantity);
    }

    cart.items[existingIndex].quantity = quantity;
    cart.items[existingIndex].totalPrice = quantity * product.apnaMartPrice;
    return this.cartRepository.saveCart(cart);
  }

  async clearCart(cartId = 'default_user_cart') {
    this.logger.info(`Clearing cart ${cartId}`);
    return this.cartRepository.clearCart(cartId);
  }
}
