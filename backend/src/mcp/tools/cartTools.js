import { z } from 'zod';

export function registerCartTools(server, cartService) {
  server.tool(
    'manage_cart',
    'Manage shopping cart on Apna Mart: view items, add items, remove items, or clear cart',
    {
      action: z.enum(['view', 'add', 'remove', 'clear']).describe('Action to perform on the cart'),
      cartId: z.string().optional().default('default_user_cart').describe('Unique cart identifier'),
      productId: z.string().optional().describe('Product ID (required for "add" and "remove")'),
      quantity: z.number().int().min(1).optional().default(1).describe('Quantity to add (for "add" action)')
    },
    async ({ action, cartId, productId, quantity }) => {
      try {
        let result;
        if (action === 'view') {
          result = await cartService.getCart(cartId);
        } else if (action === 'add') {
          if (!productId) {
            return { isError: true, content: [{ type: 'text', text: 'Product ID is required to add an item.' }] };
          }
          result = await cartService.addItem(cartId, productId, quantity);
        } else if (action === 'remove') {
          if (!productId) {
            return { isError: true, content: [{ type: 'text', text: 'Product ID is required to remove an item.' }] };
          }
          result = await cartService.removeItem(cartId, productId);
        } else if (action === 'clear') {
          result = await cartService.clearCart(cartId);
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ action, cart: result }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Cart action "${action}" failed: ${err.message}` }]
        };
      }
    }
  );
}
