import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled Server Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.errors);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message || 'Internal server error';

  return sendError(res, message, statusCode, 'INTERNAL_SERVER_ERROR');
}
