import { productService, storeService, cartService, orderService } from '../services/index.js';
import { ProductController } from './ProductController.js';
import { StoreController } from './StoreController.js';
import { CartController } from './CartController.js';
import { OrderController } from './OrderController.js';

export { ProductController } from './ProductController.js';
export { StoreController } from './StoreController.js';
export { CartController } from './CartController.js';
export { OrderController } from './OrderController.js';

export const productController = new ProductController(productService);
export const storeController = new StoreController(storeService);
export const cartController = new CartController(cartService);
export const orderController = new OrderController(orderService);
