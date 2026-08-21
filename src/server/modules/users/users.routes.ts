import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';

const router = Router();

// Super-admin only: cross-tenant user directory
router.get('/', authenticateJWT, requireRole('super_admin'), async (req: AuthenticatedRequest, res) => {
  try {
    const { role, institute_id, page = '1', limit = '100' } = req.query;
    const p = Math.max(parseInt(page as string, 10) || 1, 1);
    const l = Math.min(Math.max(parseInt(limit as string, 10) || 100, 1), 500);

    const filter: Record<string, any> = {};
    if (role) filter.role = role;
    if (institute_id) filter.institute_id = institute_id;

    const total = await repo.users.count(filter);
    const users = await repo.users.find(filter, { limit: l });

    const institutes = await repo.institutes.find({});
    const instituteMap = new Map(institutes.map((i) => [i.id, i]));

    const populated = users.map((u) => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      institute_id: u.institute_id,
      institute_name: instituteMap.get(u.institute_id)?.name || null,
      institute_code: instituteMap.get(u.institute_id)?.code || null,
      is_active: u.is_active,
      last_login_at: u.last_login_at,
      created_at: u.created_at
    }));

    const total_pages = Math.ceil(total / l) || 1;
    return sendSuccess(res, populated, 'Users retrieved', 200, undefined, {
      page: p,
      limit: l,
      total,
      total_pages
    });
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve users', 500);
  }
});

export default router;