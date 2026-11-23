export class OrderController {
  constructor(orderService) {
    this.orderService = orderService;
  }
  createOrder = async (req, res, next) => {
    try {
      const cartId = req.headers['x-cart-id'] || req.body.cartId || 'default_user_cart';
      const { customerName, customerPhone, deliveryAddress, pincode, paymentMethod } = req.body;
      const order = await this.orderService.createOrder({
        cartId,
        customerName,
        customerPhone,
        deliveryAddress,
        pincode,
        paymentMethod
      });
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: order
      });
    } catch (err) {
      next(err);
    }
  };
  getOrderById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const order = await this.orderService.getOrderById(id);
      res.json({
        success: true,
        data: order
      });
    } catch (err) {
      next(err);
    }
  };
  trackOrder = async (req, res, next) => {
    try {
      const { id } = req.params;
      const tracking = await this.orderService.trackOrder(id);
      res.json({
        success: true,
        data: tracking
      });
    } catch (err) {
      next(err);
    }
  };
  getOrdersByPhone = async (req, res, next) => {
    try {
      const { phone } = req.query;
      const orders = await this.orderService.getOrdersByPhone(phone);
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (err) {
      next(err);
    }
  };
}
