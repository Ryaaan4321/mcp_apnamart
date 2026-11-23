import { productRepository, storeRepository, cartRepository, orderRepository } from '../repositories/index.js';
import { defaultLogger } from '../logger/Logger.js';

import { ProductService } from './ProductService.js';
import { StoreService } from './StoreService.js';
import { CartService } from './CartService.js';
import { OrderService } from './OrderService.js';

export { ProductService } from './ProductService.js';
export { StoreService } from './StoreService.js';
export { CartService } from './CartService.js';
export { OrderService } from './OrderService.js';

export const productService = new ProductService(productRepository, defaultLogger);
export const storeService = new StoreService(storeRepository, defaultLogger);
export const cartService = new CartService(cartRepository, productService, defaultLogger);
export const orderService = new OrderService(orderRepository, productService, storeService, cartService, defaultLogger);
