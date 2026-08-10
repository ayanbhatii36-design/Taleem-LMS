import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { sendError } from '../utils/response';

export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');
  }

  // Super admins can explicitly pass X-Institute-Id header to operate on specific tenant
  const requestedTenant = req.headers['x-institute-id'] as string;

  if (req.user.role === 'super_admin' && requestedTenant) {
    req.institute_id = requestedTenant;
  } else {
    req.institute_id = req.user.institute_id;
  }

  if (!req.institute_id) {
    return sendError(res, 'Tenant context missing', 400, 'MISSING_TENANT_CONTEXT');
  }

  next();
}
