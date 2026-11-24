import { prisma } from '../db/prisma.js';

export class StoreRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async findAll(filterFn = null) {
    const stores = await this.prisma.store.findMany({
      orderBy: { name: 'asc' }
    });
    if (typeof filterFn === 'function') {
      return stores.filter(filterFn);
    }
    return stores;
  }

  async findById(id) {
    if (!id) return null;
    return this.prisma.store.findUnique({
      where: { id }
    });
  }

  async findByPincode(pincode) {
    const cleanPin = String(pincode).trim();
    return this.prisma.store.findMany({
      where: {
        pincodes: { has: cleanPin },
        status: 'ACTIVE'
      }
    });
  }

  async findByCity(city) {
    const cleanCity = String(city).trim();
    return this.prisma.store.findMany({
      where: {
        city: { equals: cleanCity, mode: 'insensitive' }
      }
    });
  }
}
