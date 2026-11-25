import { Logger } from '../logger/Logger.js';
import { NotFoundError, BadRequestError } from '../errors/index.js';

const VALID_SORT_OPTIONS = new Set([
  'price_asc',
  'price_desc',
  'discount_desc',
  'name_asc',
  'name_desc'
]);

export class ProductService {
  constructor(productRepository, logger = null) {
    this.productRepository = productRepository;
    this.logger = logger ? logger.forContext('ProductService') : new Logger('ProductService');
  }

  async searchProducts(filters = {}) {
    const page = filters.page !== undefined ? Number(filters.page) : 1;
    const limit = filters.limit !== undefined ? Number(filters.limit) : 20;
    const sortBy = filters.sortBy || 'name_asc';

    if (!Number.isInteger(page) || page < 1) {
      throw new BadRequestError('Page must be a positive integer');
    }
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      throw new BadRequestError('Limit must be an integer between 1 and 100');
    }
    if (!VALID_SORT_OPTIONS.has(sortBy)) {
      throw new BadRequestError(`Invalid sortBy option. Allowed values: ${Array.from(VALID_SORT_OPTIONS).join(', ')}`);
    }

    const normalizedFilters = {
      ...filters,
      page,
      limit,
      sortBy
    };

    this.logger.info('Searching products with filters:', normalizedFilters);
    const result = await this.productRepository.search(normalizedFilters);
    this.logger.debug(`Found ${result.pagination.total} products (page ${page}/${result.pagination.totalPages})`);
    return result;
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
