import { BaseRepository } from './BaseRepository.js';

const INITIAL_ORDERS = [
  {
    id: 'ord_apm_1001',
    customerName: 'Rahul Kumar',
    customerPhone: '9876543210',
    deliveryAddress: 'Flat 302, Green Park Residency, Kanke Road, Ranchi, Jharkhand - 834008',
    pincode: '834008',
    storeId: 'store_rnc_01',
    storeName: 'Apna Mart - Ranchi Main Road Supermart',
    items: [
      {
        productId: 'prod_atta_001',
        name: 'Aashirvaad Shudh Chakki Atta (5kg)',
        price: 239,
        quantity: 1,
        total: 239
      },
      {
        productId: 'prod_oil_004',
        name: 'Fortune Kachi Ghani Pure Mustard Oil (1L Pouch)',
        price: 138,
        quantity: 2,
        total: 276
      }
    ],
    subtotal: 515,
    deliveryFee: 0,
    totalAmount: 515,
    paymentMethod: 'CASH_ON_DELIVERY',
    paymentStatus: 'PENDING',
    status: 'OUT_FOR_DELIVERY',
    estimatedDeliveryMinutes: 12,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString()
  }
];

export class OrderRepository extends BaseRepository {
  constructor() {
    super('Order', INITIAL_ORDERS, 'id');
  }

  async findByPhone(phone) {
    const cleanPhone = String(phone).replace(/\D/g, '');
    return this.findAll(order => order.customerPhone.replace(/\D/g, '') === cleanPhone);
  }
}
