import { z } from 'zod';
import { UI_RESOURCES } from '../ui/buildUiResources.js';

export function registerOrderTools(server, orderService) {
  server.registerTool(
    'place_order',
    {
      description: 'Review and place an Apna Mart quick delivery grocery order from items in the cart. Call first with confirmed=false to review items, totals, and store before placing the order with confirmed=true.',
      inputSchema: {
        cartId: z.string().optional().default('default_user_cart').describe('Cart identifier containing items to order'),
        customerName: z.string().describe('Full name of the customer'),
        customerPhone: z.string().describe('10-digit mobile number for delivery updates'),
        deliveryAddress: z.string().describe('Complete street address / apartment details'),
        pincode: z.string().describe('6-digit delivery pincode (e.g. "834008")'),
        paymentMethod: z.enum(['CASH_ON_DELIVERY', 'ONLINE_UPI']).optional().default('CASH_ON_DELIVERY').describe('Payment mode'),
        confirmed: z.boolean().optional().default(false).describe('Set to true only after the user explicitly confirms the order review')
      },
      _meta: {
        ui: {
          resourceUri: UI_RESOURCES.order.uri
        }
      }
    },
    async ({ cartId, customerName, customerPhone, deliveryAddress, pincode, paymentMethod, confirmed }) => {
      try {
        if (!confirmed) {
          const review = await orderService.previewOrder({
            cartId,
            customerName,
            customerPhone,
            deliveryAddress,
            pincode,
            paymentMethod
          });
          const payload = {
            status: 'REVIEW_REQUIRED',
            message: 'Order review ready. Ask the user to confirm before calling place_order with confirmed=true.',
            review
          };
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(payload, null, 2)
              }
            ],
            structuredContent: payload
          };
        }

        const order = await orderService.createOrder({
          cartId,
          customerName,
          customerPhone,
          deliveryAddress,
          pincode,
          paymentMethod
        });
        const payload = {
          status: 'CONFIRMED',
          message: 'Order successfully placed with Apna Mart!',
          order
        };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(payload, null, 2)
            }
          ],
          structuredContent: payload
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to place order: ${err.message}` }]
        };
      }
    }
  );

  server.registerTool(
    'track_order',
    {
      description: 'Track current status and estimated delivery time for an Apna Mart order',
      inputSchema: {
        orderId: z.string().describe('The order ID (e.g. "ord_apm_1001")'),
        customerPhone: z.string().optional().describe('Customer phone number to verify order ownership')
      },
      _meta: {
        ui: {
          resourceUri: UI_RESOURCES.track.uri
        }
      }
    },
    async ({ orderId, customerPhone }) => {
      try {
        const tracking = await orderService.trackOrder(orderId, customerPhone);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(tracking, null, 2)
            }
          ],
          structuredContent: tracking
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
