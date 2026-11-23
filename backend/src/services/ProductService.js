import { Logger } from '../logger/Logger.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

export class ProductService {
  constructor(productRepository, logger = null) {
    this.productRepository = productRepository;
    this.logger = logger ? logger.forContext('ProductService') : new Logger('ProductService');
  }
  async searchProducts(filters = {}) {
    this.logger.info(`Searching products with filters:`, filters);
    const results = await this.productRepository.search(filters);
    this.logger.debug(`Found ${results.length} products matching criteria`);
    return results;
  }
  async getProductById(productId) {
    if (!productId) {
      throw new BadRequestError('Product ID is required');
    }
    this.logger.info(`Fetching product by id: ${productId}`);
    const product = await this.productRepository.findById(productId);
    if (!product) {
      this.logger.warn(`Product not found: ${productId}`);
      throw new NotFoundError('Product', productId);
    }
    return product;
  }
  async listCategories() {
    this.logger.info('Fetching product categories');
    return this.productRepository.getAllCategories();
  }
  async validateAndReserveStock(productId, quantity) {
    if (quantity <= 0) {
      throw new BadRequestError('Quantity must be greater than zero');
    }
    const product = await this.getProductById(productId);
    if (!product.isAvailable || product.stock < quantity) {
      this.logger.warn(`Insufficient stock for product ${productId}. Requested: ${quantity}, Available: ${product.stock}`);
      throw new BadRequestError(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
    }
    await this.productRepository.decrementStock(productId, quantity);
    this.logger.info(`Reserved ${quantity} units of product ${productId}`);
    return true;
  }
}
