import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

router.get('/', requirePermission('audit.view'), (req: AuthenticatedRequest, res) => {
  const { action, user_id, page = '1', limit = '50' } = req.query;

  let logs = db.auditLogs.filter((l) => l.institute_id === req.institute_id);

  if (action) logs = logs.filter((l) => l.action === action);
  if (user_id) logs = logs.filter((l) => l.user_id === user_id);

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);
  const total = logs.length;
  const total_pages = Math.ceil(total / l) || 1;
  const paginated = logs.slice((p - 1) * l, p * l);

  return sendSuccess(res, paginated, 'Audit logs retrieved', 200, undefined, {
    page: p,
    limit: l,
    total,
    total_pages
  });
});

export default router;
