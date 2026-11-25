import { prisma } from '../db/prisma.js';

const SORT_OPTIONS = {
  price_asc: { apnaMartPrice: 'asc' },
  price_desc: { apnaMartPrice: 'desc' },
  discount_desc: { discountPercentage: 'desc' },
  name_asc: { name: 'asc' },
  name_desc: { name: 'desc' }
};

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

  async search({
    query,
    category,
    brand,
    minPrice,
    maxPrice,
    inStockOnly = false,
    sortBy = 'name_asc',
    page = 1,
    limit = 20
  }) {
    const where = {};

    if (inStockOnly) {
      where.isAvailable = true;
      where.stock = { gt: 0 };
    }

    if (category) {
      where.category = { equals: category, mode: 'insensitive' };
    }

    if (brand) {
      where.brand = { equals: brand, mode: 'insensitive' };
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

    const orderBy = SORT_OPTIONS[sortBy] || SORT_OPTIONS.name_asc;
    const skip = (page - 1) * limit;

    const [items, total, categoryGroups, brandGroups, priceAgg] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limit
      }),
      this.prisma.product.count({ where }),
      this.prisma.product.groupBy({
        by: ['category'],
        where,
        _count: { _all: true },
        orderBy: { category: 'asc' }
      }),
      this.prisma.product.groupBy({
        by: ['brand'],
        where,
        _count: { _all: true },
        orderBy: { brand: 'asc' }
      }),
      this.prisma.product.aggregate({
        where,
        _min: { apnaMartPrice: true },
        _max: { apnaMartPrice: true }
      })
    ]);

    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      facets: {
        categories: categoryGroups.map(g => ({ name: g.category, count: g._count._all })),
        brands: brandGroups.map(g => ({ name: g.brand, count: g._count._all })),
        priceRange: {
          min: priceAgg._min.apnaMartPrice ?? 0,
          max: priceAgg._max.apnaMartPrice ?? 0
        }
      }
    };
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
