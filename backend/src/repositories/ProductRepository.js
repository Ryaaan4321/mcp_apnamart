import { prisma } from '../db/prisma.js';

export class ProductRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async findAll(filterFn = null) {
    const products = await this.prisma.product.findMany({
      orderBy: { name: 'asc' }
    });
    if (typeof filterFn === 'function') {
      return products.filter(filterFn);
    }
    return products;
  }

  async findById(id) {
    if (!id) return null;
    return this.prisma.product.findUnique({
      where: { id }
    });
  }

  async search({ query, category, minPrice, maxPrice, inStockOnly = false }) {
    const where = {};

    if (inStockOnly) {
      where.isAvailable = true;
      where.stock = { gt: 0 };
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.apnaMartPrice = {};
      if (minPrice !== undefined) where.apnaMartPrice.gte = minPrice;
      if (maxPrice !== undefined) where.apnaMartPrice.lte = maxPrice;
    }

    if (query) {
      const q = String(query).trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ];
    }

    return this.prisma.product.findMany({
      where,
      orderBy: { name: 'asc' }
    });
  }

  async getAllCategories() {
    const categories = await this.prisma.product.findMany({
      select: { category: true },
      distinct: ['category'],
      orderBy: { category: 'asc' }
    });
    return categories.map(c => c.category);
  }

  async decrementStock(productId, quantity) {
    const current = await this.findById(productId);
    if (!current) return null;

    const newStock = Math.max(0, current.stock - quantity);
    return this.prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        isAvailable: newStock > 0
      }
    });
  }
}
