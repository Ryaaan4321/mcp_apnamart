import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mcpServerName: process.env.MCP_SERVER_NAME || 'apna-mart-mcp',
  mcpServerVersion: process.env.MCP_SERVER_VERSION || '1.0.0',
  logLevel: process.env.LOG_LEVEL || 'info',
};
