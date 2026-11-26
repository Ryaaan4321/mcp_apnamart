import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { defaultLogger } from '../logger/Logger.js';
import { productService, storeService, cartService, orderService } from '../services/index.js';
import { registerProductTools } from './tools/productTools.js';
import { registerStoreTools } from './tools/storeTools.js';
import { registerCartTools } from './tools/cartTools.js';
import { registerOrderTools } from './tools/orderTools.js';
import { registerGroceryPrompts } from './prompts/groceryPrompts.js';
import { UI_RESOURCES, UI_CSP_META, getUiHtml } from './ui/buildUiResources.js';

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
  registerGroceryPrompts(server);

  for (const [key, def] of Object.entries(UI_RESOURCES)) {
    server.registerResource(
      def.name,
      def.uri,
      {
        title: def.title,
        mimeType: 'text/html;profile=mcp-app',
        _meta: UI_CSP_META
      },
      async (uri) => ({
        contents: [
          {
            uri: uri.href,
            mimeType: 'text/html;profile=mcp-app',
            text: getUiHtml(key),
            _meta: UI_CSP_META
          }
        ]
      })
    );
  }

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

  logger.info('Apna Mart MCP Server initialized with tools, prompts, and resources.');
  return server;
}
