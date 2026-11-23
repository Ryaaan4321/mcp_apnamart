import { z } from 'zod';


export function registerOrderTools(server, orderService) {
  server.tool(
    'place_order',
    'Place an Apna Mart quick delivery grocery order from items in the cart',
    {
      cartId: z.string().optional().default('default_user_cart').describe('Cart identifier containing items to order'),
      customerName: z.string().describe('Full name of the customer'),
      customerPhone: z.string().describe('10-digit mobile number for delivery updates'),
      deliveryAddress: z.string().describe('Complete street address / apartment details'),
      pincode: z.string().describe('6-digit delivery pincode (e.g. "834008")'),
      paymentMethod: z.enum(['CASH_ON_DELIVERY', 'ONLINE_UPI']).optional().default('CASH_ON_DELIVERY').describe('Payment mode')
    },
    async ({ cartId, customerName, customerPhone, deliveryAddress, pincode, paymentMethod }) => {
      try {
        const order = await orderService.createOrder({
          cartId,
          customerName,
          customerPhone,
          deliveryAddress,
          pincode,
          paymentMethod
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                message: 'Order successfully placed with Apna Mart!',
                order
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to place order: ${err.message}` }]
        };
      }
    }
  );

  server.tool(
    'track_order',
    'Track current status and estimated delivery time for an Apna Mart order',
    {
      orderId: z.string().describe('The order ID (e.g. "ord_apm_1001")')
    },
    async ({ orderId }) => {
      try {
        const tracking = await orderService.trackOrder(orderId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tracking, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Order tracking failed: ${err.message}` }]
        };
      }
    }
  );
}
