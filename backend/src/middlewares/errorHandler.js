import { defaultLogger } from '../logger/Logger.js';
import { AppError } from '../errors/AppError.js';

export function errorHandler(err, req, res, next) {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';

  if (!isAppError || statusCode >= 500) {
    defaultLogger.error(`Unhandled Exception at ${req.method} ${req.originalUrl}:`, err);
  } else {
    defaultLogger.warn(`Operational Error at ${req.method} ${req.originalUrl} [${statusCode}]: ${message}`);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      details: err.details || null
    }
  });
}
