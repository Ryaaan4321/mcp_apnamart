import { z } from 'zod';
import { UI_RESOURCES } from '../ui/buildUiResources.js';

export function registerProductTools(server, productService) {
  server.registerTool(
    'search_products',
    {
      description: 'Search Apna Mart grocery and household product catalog with filtering, sorting, pagination, and facet aggregations',
      inputSchema: {
        query: z.string().optional().describe('Search query keyword (e.g. "atta", "fortune oil", "amul milk", "maggi")'),
        category: z.string().optional().describe('Filter by product category (e.g. "Staples & Grains", "Dairy & Bakery", "Oils & Spices")'),
        brand: z.string().optional().describe('Filter by brand name (e.g. "Amul", "Aashirvaad", "Fortune")'),
        minPrice: z.number().optional().describe('Minimum Apna Mart price in INR'),
        maxPrice: z.number().optional().describe('Maximum Apna Mart price in INR'),
        inStockOnly: z.boolean().optional().default(false).describe('Show only items currently in stock'),
        sortBy: z.enum(['price_asc', 'price_desc', 'discount_desc', 'name_asc', 'name_desc']).optional().default('name_asc').describe('Sort order for matching products'),
        page: z.number().int().min(1).optional().default(1).describe('Page number (1-indexed)'),
        limit: z.number().int().min(1).max(100).optional().default(20).describe('Number of products per page')
      },
      _meta: {
        ui: {
          resourceUri: UI_RESOURCES.products.uri
        }
      }
    },
    async ({ query, category, brand, minPrice, maxPrice, inStockOnly, sortBy, page, limit }) => {
      try {
        const result = await productService.searchProducts({
          query,
          category,
          brand,
          minPrice,
          maxPrice,
          inStockOnly,
          sortBy,
          page,
          limit
        });
        const payload = {
          count: result.items.length,
          pagination: result.pagination,
          facets: result.facets,
          products: result.items
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
          content: [{ type: 'text', text: `Failed to search products: ${err.message}` }]
        };
      }
    }
  );

  server.tool(
    'get_product_details',
    'Get detailed pricing, stock, unit weight, image URLs, and description of a specific Apna Mart product',
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
          ],
          structuredContent: product
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
