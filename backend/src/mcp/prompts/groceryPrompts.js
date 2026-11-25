import { z } from 'zod';

export function registerGroceryPrompts(server) {
  server.prompt(
    'plan_weekly_groceries',
    'Plan a weekly Apna Mart grocery basket with staples and daily essentials tailored to a budget and household size',
    {
      budget: z.string().optional().describe('Target budget in INR (e.g. "1500")'),
      householdSize: z.string().optional().describe('Number of people in the household (e.g. "4")'),
      preferences: z.string().optional().describe('Any specific needs or preferences (e.g. "vegetarian, focus on staples and dairy")')
    },
    ({ budget, householdSize, preferences }) => {
      const budgetText = budget ? `within a budget of INR ${budget}` : 'with cost-effective wholesale pricing';
      const sizeText = householdSize ? `for a household of ${householdSize} people` : 'for a typical household';
      const prefText = preferences ? ` Preferences: ${preferences}.` : '';

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                `Help me plan a weekly grocery basket from Apna Mart ${sizeText} ${budgetText}.${prefText}`,
                'Follow these steps:',
                '1. Call list_categories and search_products (with inStockOnly: true) to inspect available Apna Mart staples, oils, dairy, snacks, and household items.',
                '2. Select a balanced combination of items staying within the budget, showing each item name, unit, Apna Mart price, MRP, and total savings.',
                '3. Ask if I would like to add this recommended basket to my cart using manage_cart.'
              ].join('\n')
            }
          }
        ]
      };
    }
  );

  server.prompt(
    'check_pincode_and_order',
    'Guided flow to verify Apna Mart quick delivery coverage for a pincode before building a shopping cart and placing an order',
    {
      pincode: z.string().describe('6-digit Indian postal code (e.g. "834001")')
    },
    ({ pincode }) => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              `I want to order groceries from Apna Mart to pincode ${pincode}.`,
              'Follow these steps:',
              `1. First, call check_delivery_serviceability for pincode "${pincode}".`,
              '2. If serviceable, share the assigned Apna Mart supermart name, address, and estimated delivery time, then ask me what items I need or suggest popular categories using list_categories.',
              '3. Once I confirm my items, add them with manage_cart and collect my name, phone number, full delivery address, and payment method (CASH_ON_DELIVERY or ONLINE_UPI) before calling place_order.',
              '4. If not serviceable, inform me clearly and use list_stores to show nearby cities where Apna Mart currently delivers.'
            ].join('\n')
          }
        }
      ]
    })
  );

  server.prompt(
    'reorder_essentials',
    'Review a previous Apna Mart order and quickly reorder available essentials into the shopping cart',
    {
      orderId: z.string().optional().describe('Previous order ID to reorder from (e.g. "ord_apm_1001")'),
      cartId: z.string().optional().describe('Target cart ID (defaults to "default_user_cart")')
    },
    ({ orderId, cartId }) => {
      const targetCart = cartId || 'default_user_cart';
      const orderLookupInstruction = orderId
        ? `1. Call track_order for orderId "${orderId}" to inspect the previous order details.`
        : '1. Ask me for my previous order ID (for example, "ord_apm_1001") so you can look it up with track_order.';

      return {
        messages: [
          {
            role: 'user',
            content: {
              type: 'text',
              text: [
                'I want to reorder my essentials from a previous Apna Mart order.',
                'Follow these steps:',
                orderLookupInstruction,
                `2. Present the summary and check current availability using search_products or get_product_details.`,
                `3. Ask for my confirmation, then add the available items to cart "${targetCart}" using manage_cart.`,
                '4. Verify my delivery pincode, address, phone number, and payment preference before calling place_order.'
              ].join('\n')
            }
          }
        ]
      };
    }
  );
}
