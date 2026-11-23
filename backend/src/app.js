import express from 'express';
import cors from 'cors';
import { requestLogger } from './middlewares/requestLogger.js';
import { errorHandler } from './middlewares/errorHandler.js';
import apiRouter from './routes/index.js';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);
  app.get('/health', (req, res) => {
    res.json({
      status: 'UP',
      brand: 'Apna Mart (apnamart.in)',
      service: 'Dual REST API & Model Context Protocol (MCP) Server',
      timestamp: new Date().toISOString()
    });
  });
  app.use('/api/v1', apiRouter);
  app.use(errorHandler);
  return app;
}
