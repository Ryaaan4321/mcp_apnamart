import { z } from 'zod';

export function registerStoreTools(server, storeService) {
  server.tool(
    'check_delivery_serviceability',
    'Check if an Indian 6-digit postal code (pincode) is serviceable by Apna Mart for hyper-local delivery',
    {
      pincode: z.string().describe('6-digit Indian postal code (e.g. "834001", "831001", "492001")')
    },
    async ({ pincode }) => {
      try {
        const result = await storeService.checkServiceability(pincode);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Serviceability check error: ${err.message}` }]
        };
      }
    }
  );

  server.tool(
    'list_stores',
    'List Apna Mart physical supermarts and pickup hubs, optionally filtered by city',
    {
      city: z.string().optional().describe('City name to filter stores (e.g. "Ranchi", "Jamshedpur", "Raipur", "Howrah")')
    },
    async ({ city }) => {
      try {
        const stores = await storeService.listStores(city);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ count: stores.length, stores }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to list stores: ${err.message}` }]
        };
      }
    }
  );
}
