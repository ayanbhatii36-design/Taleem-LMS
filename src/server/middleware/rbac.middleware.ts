import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { sendError } from '../utils/response';
import { Permission, SystemRole } from '../types/backend';
import { ROLE_PERMISSIONS } from '../config/constants';

export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    const userPermissions = req.user.permissions || ROLE_PERMISSIONS[req.user.role] || [];
    
    if (!userPermissions.includes(permission) && req.user.role !== 'super_admin') {
      return sendError(
        res,
        `Forbidden: Insufficient permission '${permission}' required for this action`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}

export function requireRole(...roles: SystemRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
    }

    if (!roles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return sendError(
        res,
        `Forbidden: Access restricted to roles [${roles.join(', ')}]`,
        403,
        'FORBIDDEN'
      );
    }

    next();
  };
}
