import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { defaultLogger } from '../logger/Logger.js';
import { productService, storeService, cartService, orderService } from '../services/index.js';
import { registerProductTools } from './tools/productTools.js';
import { registerStoreTools } from './tools/storeTools.js';
import { registerCartTools } from './tools/cartTools.js';
import { registerOrderTools } from './tools/orderTools.js';

export function createMcpServer() {
  const logger = defaultLogger.forContext('McpServer');

  const server = new McpServer({
    name: 'apna-mart-mcp',
    version: '1.0.0'
  });

  registerProductTools(server, productService);
  registerStoreTools(server, storeService);
  registerCartTools(server, cartService);
  registerOrderTools(server, orderService);

  server.resource(
    'categories',
    'apnamart://products/categories',
    async (uri) => {
      const categories = await productService.listCategories();
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(categories, null, 2),
            mimeType: 'application/json'
          }
        ]
      };
    }
  );

  server.resource(
    'stores',
    'apnamart://stores',
    async (uri) => {
      const stores = await storeService.listStores();
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify(stores, null, 2),
            mimeType: 'application/json'
          }
        ]
      };
    }
  );

  logger.info('Apna Mart MCP Server initialized with tools and resources.');
  return server;
}
