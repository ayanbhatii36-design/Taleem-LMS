import { Request, Response, NextFunction } from 'express';
import { sendError } from '../utils/response';

interface RateRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateRecord>();

export function createRateLimiter(windowMs: number = 15 * 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    const record = rateLimitStore.get(key);

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    if (record.count >= maxRequests) {
      const retryAfterSec = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      return sendError(
        res,
        `Too many requests. Please try again after ${retryAfterSec} seconds.`,
        429,
        'RATE_LIMIT_EXCEEDED',
        { retryAfterSeconds: retryAfterSec }
      );
    }

    record.count++;
    next();
  };
}
