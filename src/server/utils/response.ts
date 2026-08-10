import { Response } from 'express';
import { ApiResponse } from '../types/backend';

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Operation successful',
  statusCode = 200,
  meta?: Record<string, any>,
  pagination?: ApiResponse['pagination']
): Response {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
    ...(pagination ? { pagination } : {})
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  code = 'BAD_REQUEST',
  details?: any
): Response {
  const payload: ApiResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {})
    }
  };
  return res.status(statusCode).json(payload);
}
