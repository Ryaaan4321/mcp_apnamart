import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { defaultLogger } from './logger/Logger.js';
import { createMcpServer } from './mcp/index.js';

const logger = defaultLogger.forContext('Server');
const app = createApp();

// Stateless Streamable HTTP transport so Render restarts/redeploys never invalidate active Claude sessions.
app.post('/mcp', async (req, res) => {
  const sessionServer = createMcpServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on('close', () => {
    transport.close().catch(() => {});
    sessionServer.close().catch(() => {});
  });

  try {
    await sessionServer.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    logger.error('Error handling POST /mcp:', err);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: 'Internal server error' },
        id: null
      });
    }
  }
});

app.get('/mcp', (req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null
  });
});

app.delete('/mcp', (req, res) => {
  res.status(405).json({
    jsonrpc: '2.0',
    error: { code: -32000, message: 'Method not allowed.' },
    id: null
  });
});

const server = app.listen(config.port, () => {
  logger.info('=======================================================');
  logger.info(' Apna Mart Dual REST API & MCP Server is Live!');
  logger.info(` Port: ${config.port} | Mode: ${config.nodeEnv}`);
  logger.info(` REST Health: http://localhost:${config.port}/health`);
  logger.info(` REST API:    http://localhost:${config.port}/api/v1/products/search`);
  logger.info(` MCP HTTP:    http://localhost:${config.port}/mcp`);
  logger.info('=======================================================');
});

export default server;
