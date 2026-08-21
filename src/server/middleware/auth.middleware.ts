import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { AuthSession } from '../types/backend';
import { repo } from '../db/repository';

export interface AuthenticatedRequest extends Request {
  user?: AuthSession['user'];
  institute_id?: string;
}

export async function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token && req.query.token) {
    token = req.query.token as string;
  }

  if (!token) {
    return sendError(res, 'Authentication token required', 401, 'UNAUTHORIZED');
  }

  try {
    const decoded = verifyToken(token);

    // Check if user still exists and active
    const user = await repo.users.findOne({ id: decoded.id });
    if (!user || !user.is_active) {
      return sendError(res, 'User account deactivated or not found', 401, 'UNAUTHORIZED');
    }

    req.user = decoded;
    req.institute_id = decoded.institute_id;
    next();
  } catch (err: any) {
    return sendError(res, 'Invalid or expired token', 401, 'TOKEN_EXPIRED');
  }
}