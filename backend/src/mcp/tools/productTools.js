import { z } from 'zod';

export function registerProductTools(server, productService) {
  server.tool(
    'search_products',
    'Search Apna Mart grocery and household product catalog by keyword, category, price range, or stock status',
    {
      query: z.string().optional().describe('Search query keyword (e.g. "atta", "fortune oil", "amul milk", "maggi")'),
      category: z.string().optional().describe('Filter by product category (e.g. "Staples & Grains", "Dairy & Bakery", "Oils & Spices")'),
      minPrice: z.number().optional().describe('Minimum Apna Mart price in INR'),
      maxPrice: z.number().optional().describe('Maximum Apna Mart price in INR'),
      inStockOnly: z.boolean().optional().default(false).describe('Show only items currently in stock')
    },
    async ({ query, category, minPrice, maxPrice, inStockOnly }) => {
      try {
        const results = await productService.searchProducts({ query, category, minPrice, maxPrice, inStockOnly });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                count: results.length,
                products: results
              }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to search products: ${err.message}` }]
        };
      }
    }
  );

  server.tool(
    'get_product_details',
    'Get detailed pricing, stock, unit weight, and description of a specific Apna Mart product',
    {
      productId: z.string().describe('The product ID (e.g. "prod_atta_001")')
    },
    async ({ productId }) => {
      try {
        const product = await productService.getProductById(productId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(product, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Product not found: ${err.message}` }]
        };
      }
    }
  );

  server.tool(
    'list_categories',
    'List all available grocery, staples, household, and FMCG categories in Apna Mart',
    {},
    async () => {
      try {
        const categories = await productService.listCategories();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ categories }, null, 2)
            }
          ]
        };
      } catch (err) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Failed to list categories: ${err.message}` }]
        };
      }
    }
  );
}
