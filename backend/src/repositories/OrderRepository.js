import { prisma } from '../db/prisma.js';

export class OrderRepository {
  constructor(prismaClient = prisma) {
    this.prisma = prismaClient;
  }

  async create(orderData) {
    return this.prisma.order.create({
      data: {
        ...orderData,
        placedAt: orderData.placedAt ? new Date(orderData.placedAt) : new Date()
      }
    });
  }

  async findById(id) {
    if (!id) return null;
    return this.prisma.order.findUnique({
      where: { id }
    });
  }

  async findByPhone(phone) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    return this.prisma.order.findMany({
      where: {
        customerPhone: { contains: cleanPhone }
      },
      orderBy: { placedAt: 'desc' }
    });
  }

  async findAll() {
    return this.prisma.order.findMany({
      orderBy: { placedAt: 'desc' }
    });
  }
}
