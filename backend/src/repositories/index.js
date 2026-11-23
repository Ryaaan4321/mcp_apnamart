import { ProductRepository } from './ProductRepository.js';
import { StoreRepository } from './StoreRepository.js';
import { CartRepository } from './CartRepository.js';
import { OrderRepository } from './OrderRepository.js';

export { BaseRepository } from './BaseRepository.js';
export { ProductRepository } from './ProductRepository.js';
export { StoreRepository } from './StoreRepository.js';
export { CartRepository } from './CartRepository.js';
export { OrderRepository } from './OrderRepository.js';

export const productRepository = new ProductRepository();
export const storeRepository = new StoreRepository();
export const cartRepository = new CartRepository();
export const orderRepository = new OrderRepository();
