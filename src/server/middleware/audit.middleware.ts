import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { repo } from '../db/repository';

export function auditAction(actionName: string, targetResource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        repo.auditLogs.insertOne({
          institute_id: req.institute_id || req.user.institute_id,
          user_id: req.user.id,
          user_name: req.user.full_name,
          user_role: req.user.role,
          action: actionName,
          target_resource: targetResource,
          target_id: (req.params.id || req.body.id || req.query.id) as string,
          ip_address: req.ip,
          metadata_json: JSON.stringify({ path: req.originalUrl, method: req.method })
        }).catch(() => {});
      }
    });
    next();
  };
}