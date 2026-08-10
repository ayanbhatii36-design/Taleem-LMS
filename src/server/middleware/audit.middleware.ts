import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { db } from '../db/database';

export function auditAction(actionName: string, targetResource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        db.logAudit(
          req.institute_id || req.user.institute_id,
          req.user.id,
          req.user.full_name,
          req.user.role,
          actionName,
          targetResource,
          (req.params.id || req.body.id || req.query.id) as string,
          req.ip,
          { path: req.originalUrl, method: req.method }
        );
      }
    });
    next();
  };
}
