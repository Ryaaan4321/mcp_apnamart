import { Logger } from '../logger/Logger.js';
import { BadRequestError, NotFoundError } from '../errors/index.js';

export class OrderService {
  constructor(orderRepository, productService, storeService, cartService, logger = null) {
    this.orderRepository = orderRepository;
    this.productService = productService;
    this.storeService = storeService;
    this.cartService = cartService;
    this.logger = logger ? logger.forContext('OrderService') : new Logger('OrderService');
  }

  async _validateOrderInputs({ cartId = 'default_user_cart', customerName, customerPhone, deliveryAddress, pincode }) {
    if (!customerName || !customerPhone || !deliveryAddress || !pincode) {
      throw new BadRequestError('Customer name, phone, delivery address, and pincode are required');
    }

    const serviceability = await this.storeService.checkServiceability(pincode);
    if (!serviceability.isServiceable) {
      this.logger.warn(`Order rejected: Pincode ${pincode} is not serviceable`);
      throw new BadRequestError(`Cannot place order. ${serviceability.message}`);
    }

    const cart = await this.cartService.getCart(cartId);
    if (!cart.items || cart.items.length === 0) {
      this.logger.warn(`Order rejected: Cart ${cartId} is empty`);
      throw new BadRequestError('Cannot place order with an empty cart');
    }

    for (const item of cart.items) {
      const product = await this.productService.getProductById(item.productId);
      if (!product.isAvailable || product.stock < item.quantity) {
        throw new BadRequestError(`Insufficient stock for "${product.name}". Only ${product.stock} available.`);
      }
    }

    const deliveryFee = cart.subtotal >= 499 ? 0 : 25;
    const totalAmount = cart.subtotal + deliveryFee;

    return { serviceability, cart, deliveryFee, totalAmount };
  }

  async previewOrder({
    cartId = 'default_user_cart',
    customerName,
    customerPhone,
    deliveryAddress,
    pincode,
    paymentMethod = 'CASH_ON_DELIVERY'
  }) {
    this.logger.info(`Generating order review for customer: ${customerName}, phone: ${customerPhone}`);
    const { serviceability, cart, deliveryFee, totalAmount } = await this._validateOrderInputs({
      cartId,
      customerName,
      customerPhone,
      deliveryAddress,
      pincode
    });

    return {
      requiresConfirmation: true,
      cartId,
      customerName,
      customerPhone,
      deliveryAddress,
      pincode,
      store: {
        id: serviceability.store.id,
        name: serviceability.store.name,
        city: serviceability.store.city,
        estimatedDeliveryMinutes: serviceability.estimatedDeliveryMinutes
      },
      items: cart.items,
      subtotal: cart.subtotal,
      totalSavings: cart.totalSavings || 0,
      deliveryFee,
      totalAmount,
      paymentMethod
    };
  }

  async createOrder({
    cartId = 'default_user_cart',
    customerName,
    customerPhone,
    deliveryAddress,
    pincode,
    paymentMethod = 'CASH_ON_DELIVERY'
  }) {
    this.logger.info(`Initiating order creation for customer: ${customerName}, phone: ${customerPhone}`);

    const { serviceability, cart, deliveryFee, totalAmount } = await this._validateOrderInputs({
      cartId,
      customerName,
      customerPhone,
      deliveryAddress,
      pincode
    });

    for (const item of cart.items) {
      await this.productService.validateAndReserveStock(item.productId, item.quantity);
    }

    const orderId = `ord_apm_${Date.now()}`;
    const orderData = {
      id: orderId,
      customerName,
      customerPhone,
      deliveryAddress,
      pincode,
      storeId: serviceability.store.id,
      storeName: serviceability.store.name,
      items: [...cart.items],
      subtotal: cart.subtotal,
      deliveryFee,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'ONLINE_UPI' ? 'PAID' : 'PENDING',
      status: 'CONFIRMED',
      estimatedDeliveryMinutes: serviceability.estimatedDeliveryMinutes,
      placedAt: new Date().toISOString()
    };

    const createdOrder = await this.orderRepository.create(orderData);
    this.logger.info(`Order placed successfully: ${orderId}. Total: ₹${createdOrder.totalAmount}`);

    await this.cartService.clearCart(cartId);

    return createdOrder;
  }

  async getOrderById(orderId, customerPhone = null) {
    if (!orderId) {
      throw new BadRequestError('Order ID is required');
    }
    this.logger.info(`Fetching order details: ${orderId}`);
    const order = await this.orderRepository.findById(orderId);
    if (!order) {
      this.logger.warn(`Order not found: ${orderId}`);
      throw new NotFoundError('Order', orderId);
    }
    if (customerPhone) {
      const cleanReq = String(customerPhone).replace(/\D/g, '');
      const cleanOrder = String(order.customerPhone).replace(/\D/g, '');
      if (cleanReq !== cleanOrder) {
        this.logger.warn(`Order ${orderId} access denied for mismatched phone`);
        throw new NotFoundError('Order', orderId);
      }
    }
    return order;
  }

  async trackOrder(orderId, customerPhone = null) {
    const order = await this.getOrderById(orderId, customerPhone);
    const stages = ['CONFIRMED', 'PACKING', 'OUT_FOR_DELIVERY', 'DELIVERED'];
    const placedTime = new Date(order.placedAt || order.createdAt).getTime();
    let computedStatus = order.status || 'CONFIRMED';

    if (Number.isFinite(placedTime)) {
      const elapsedSec = Math.max(0, (Date.now() - placedTime) / 1000);
      let timeIdx = 0;
      if (elapsedSec >= 75) timeIdx = 3;
      else if (elapsedSec >= 45) timeIdx = 2;
      else if (elapsedSec >= 20) timeIdx = 1;

      const currentIdx = stages.indexOf(order.status);
      computedStatus = stages[Math.max(currentIdx, timeIdx)];
    }

    const baseEta = Number(order.estimatedDeliveryMinutes || 15);
    const etaByStage = {
      CONFIRMED: baseEta,
      PACKING: Math.max(2, Math.round(baseEta * 0.7)),
      OUT_FOR_DELIVERY: Math.max(1, Math.round(baseEta * 0.35)),
      DELIVERED: 0
    };

    return {
      orderId: order.id,
      status: computedStatus,
      customerName: order.customerName,
      storeName: order.storeName,
      deliveryAddress: order.deliveryAddress,
      pincode: order.pincode,
      paymentMethod: order.paymentMethod,
      items: order.items,
      itemsCount: order.items.length,
      totalAmount: order.totalAmount,
      estimatedDeliveryMinutes: etaByStage[computedStatus] ?? baseEta,
      placedAt: order.placedAt || order.createdAt
    };
  }

  async getOrdersByPhone(phone) {
    if (!phone) {
      throw new BadRequestError('Phone number is required');
    }
    this.logger.info(`Fetching orders for phone: ${phone}`);
    return this.orderRepository.findByPhone(phone);
  }
}
