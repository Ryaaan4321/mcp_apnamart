import { createApp } from './app.js';
import { config } from './config/env.js';
import { defaultLogger } from './logger/Logger.js';
import { createMcpServer } from './mcp/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';

const logger = defaultLogger.forContext('Server');
const app = createApp();

const sseTransports = new Map();

app.get('/sse', async (req, res) => {
  logger.info('New incoming SSE connection for MCP');
  const sessionServer = createMcpServer();
  const transport = new SSEServerTransport('/messages', res);
  sseTransports.set(transport.sessionId, { transport, server: sessionServer });

  res.on('close', () => {
    logger.info(`SSE client disconnected: ${transport.sessionId}`);
    sseTransports.delete(transport.sessionId);
  });

  await sessionServer.connect(transport);
});

app.post('/messages', async (req, res) => {
  const sessionId = req.query.sessionId;
  const session = sseTransports.get(sessionId);
  if (session) {
    await session.transport.handlePostMessage(req, res, req.body);
  } else {
    res.status(404).send('Session not found or expired');
  }
});

const server = app.listen(config.port, () => {
  logger.info(`=======================================================`);
  logger.info(` Apna Mart Dual REST API & MCP Server is Live!`);
  logger.info(` Port: ${config.port} | Mode: ${config.nodeEnv}`);
  logger.info(` REST Health: http://localhost:${config.port}/health`);
  logger.info(` REST API:    http://localhost:${config.port}/api/v1/products/search`);
  logger.info(` MCP SSE:     http://localhost:${config.port}/sse`);
  logger.info(`=======================================================`);
});

export default server;
