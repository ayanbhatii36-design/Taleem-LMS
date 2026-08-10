import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { Institute } from '../../types/backend';

const router = Router();

// List Institutes (Super admin only or current institute)
router.get('/', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (req.user?.role === 'super_admin') {
    return sendSuccess(res, db.institutes, 'Institutes retrieved');
  }
  const institute = db.institutes.find((i) => i.id === req.institute_id);
  return sendSuccess(res, institute ? [institute] : [], 'Institute retrieved');
});

// Get Institute Details
router.get('/:id', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const institute = db.institutes.find((i) => i.id === req.params.id);
  if (!institute) return sendError(res, 'Institute not found', 404);
  return sendSuccess(res, institute);
});

// Create Institute (Super admin)
router.post('/', authenticateJWT, requirePermission('institute.create'), (req: AuthenticatedRequest, res) => {
  const { name, code, phone, email, address, city, province, grading_scheme_type } = req.body;
  if (!name || !code) {
    return sendError(res, 'Name and code are required', 400);
  }

  const existing = db.institutes.find((i) => i.code.toLowerCase() === code.toLowerCase());
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

  db.institutes.push(newInstitute);
  return sendSuccess(res, newInstitute, 'Institute created successfully', 201);
});

// Update Institute / Branding Configuration
router.put('/:id', authenticateJWT, requirePermission('institute.edit'), (req: AuthenticatedRequest, res) => {
  const instIndex = db.institutes.findIndex((i) => i.id === req.params.id);
  if (instIndex === -1) return sendError(res, 'Institute not found', 404);

  const updated: Institute = {
    ...db.institutes[instIndex],
    ...req.body,
    updated_at: new Date().toISOString()
  };

  db.institutes[instIndex] = updated;
  return sendSuccess(res, updated, 'Institute configuration updated');
});

export default router;
