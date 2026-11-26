import { randomUUID } from 'node:crypto';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createApp } from './app.js';
import { config } from './config/env.js';
import { defaultLogger } from './logger/Logger.js';
import { createMcpServer } from './mcp/index.js';

const logger = defaultLogger.forContext('Server');
const app = createApp();

const mcpSessions = new Map();

app.post('/mcp', async (req, res) => {
  try {
    const sessionId = req.headers['mcp-session-id'];

    if (sessionId && mcpSessions.has(sessionId)) {
      const { transport } = mcpSessions.get(sessionId);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    if (!sessionId && isInitializeRequest(req.body)) {
      const sessionServer = createMcpServer();
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (sid) => {
          logger.info(`New MCP Streamable HTTP session initialized: ${sid}`);
          mcpSessions.set(sid, { transport, server: sessionServer });
        }
      });

      transport.onclose = () => {
        const sid = transport.sessionId;
        if (sid && mcpSessions.has(sid)) {
          logger.info(`MCP session closed: ${sid}`);
          mcpSessions.delete(sid);
        }
      };

      await sessionServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    }

    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32000, message: 'Bad Request: No valid MCP session ID provided' },
      id: null
    });
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

app.get('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !mcpSessions.has(sessionId)) {
    res.status(400).send('Invalid or missing mcp-session-id header');
    return;
  }
  const { transport } = mcpSessions.get(sessionId);
  await transport.handleRequest(req, res);
});

app.delete('/mcp', async (req, res) => {
  const sessionId = req.headers['mcp-session-id'];
  if (!sessionId || !mcpSessions.has(sessionId)) {
    res.status(400).send('Invalid or missing mcp-session-id header');
    return;
  }
  const { transport } = mcpSessions.get(sessionId);
  await transport.handleRequest(req, res);
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
