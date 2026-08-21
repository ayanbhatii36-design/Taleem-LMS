import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

router.get('/', requirePermission('audit.view'), async (req: AuthenticatedRequest, res) => {
  try {
    const { action, user_id, page = '1', limit = '50' } = req.query;
    const p = Math.max(parseInt(page as string, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit as string, 10) || 50, 1), 200);

    const filter: Record<string, any> = { institute_id: req.institute_id };
    if (action) filter.action = action;
    if (user_id) filter.user_id = user_id;

    const total = await repo.auditLogs.count(filter);
    const logs = await repo.auditLogs.find(filter, {
      sort: { field: 'created_at', direction: -1 },
      limit: l
    });

    const total_pages = Math.ceil(total / l) || 1;
    const paginated = logs.slice((p - 1) * l, p * l);

    return sendSuccess(res, paginated, 'Audit logs retrieved', 200, undefined, {
      page: p,
      limit: l,
      total,
      total_pages
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve audit logs', 500);
  }
});

export default router;