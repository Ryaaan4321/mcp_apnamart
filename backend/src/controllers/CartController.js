export class CartController {
  constructor(cartService) {
    this.cartService = cartService;
  }
  getCart = async (req, res, next) => {
    try {
      const cartId = req.headers['x-cart-id'] || req.query.cartId || 'default_user_cart';
      const cart = await this.cartService.getCart(cartId);
      res.json({
        success: true,
        data: cart
      });
    } catch (err) {
      next(err);
    }
  };
  addItem = async (req, res, next) => {
    try {
      const cartId = req.headers['x-cart-id'] || req.body.cartId || 'default_user_cart';
      const { productId, quantity } = req.body;
      const cart = await this.cartService.addItem(cartId, productId, quantity ? parseInt(quantity, 10) : 1);
      res.json({
        success: true,
        message: 'Item added to cart',
        data: cart
      });
    } catch (err) {
      next(err);
    }
  };
  removeItem = async (req, res, next) => {
    try {
      const cartId = req.headers['x-cart-id'] || req.query.cartId || 'default_user_cart';
      const { productId } = req.params;
      const cart = await this.cartService.removeItem(cartId, productId);
      res.json({
        success: true,
        message: 'Item removed from cart',
        data: cart
      });
    } catch (err) {
      next(err);
    }
  };
  clearCart = async (req, res, next) => {
    try {
      const cartId = req.headers['x-cart-id'] || req.body.cartId || 'default_user_cart';
      const cart = await this.cartService.clearCart(cartId);
      res.json({
        success: true,
        message: 'Cart cleared',
        data: cart
      });
    } catch (err) {
      next(err);
    }
  };
}
