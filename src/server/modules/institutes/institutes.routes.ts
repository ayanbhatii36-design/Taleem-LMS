import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { Institute } from '../../types/backend';

const router = Router();

// List Institutes (Super admin only or current institute)
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user?.role === 'super_admin') {
    const institutes = await repo.institutes.find({});
    return sendSuccess(res, institutes, 'Institutes retrieved');
  }
  const institute = await repo.institutes.findOne({ id: req.institute_id });
  return sendSuccess(res, institute ? [institute] : [], 'Institute retrieved');
});

// Get Institute Details
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  const institute = await repo.institutes.findOne({ id: req.params.id });
  if (!institute) return sendError(res, 'Institute not found', 404);
  return sendSuccess(res, institute);
});

// Create Institute (Super admin)
router.post('/', authenticateJWT, requirePermission('institute.create'), async (req: AuthenticatedRequest, res) => {
  const { name, code, phone, email, address, city, province, grading_scheme_type } = req.body;
  if (!name || !code) {
    return sendError(res, 'Name and code are required', 400);
  }

  const existing = await repo.institutes.findOne({
    code: { $regex: `^${code.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' }
  });
  if (existing) {
    return sendError(res, 'Institute code already exists', 400);
  }

  const newInstitute: Institute = {
    id: `inst-${Date.now()}`,
    name,
    code,
    phone: phone || '+92 51 0000000',
    email: email || 'info@school.edu.pk',
    address: address || 'Pakistan',
    city: city || 'Islamabad',
    province: province || 'Federal',
    country: 'Pakistan',
    grading_scheme_type: grading_scheme_type || 'PERCENTAGE',
    currency: 'PKR',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.institutes.insertOne(newInstitute);
  return sendSuccess(res, created, 'Institute created successfully', 201);
});

// Update Institute / Branding Configuration
router.put('/:id', authenticateJWT, requirePermission('institute.edit'), async (req: AuthenticatedRequest, res) => {
  const existing = await repo.institutes.findOne({ id: req.params.id });
  if (!existing) return sendError(res, 'Institute not found', 404);

  const updated = await repo.institutes.updateOne({ id: req.params.id }, req.body);
  return sendSuccess(res, updated, 'Institute configuration updated');
});

export default router;
