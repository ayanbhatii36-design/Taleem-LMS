import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { hashPassword } from '../../utils/password';
import { ParentEntity, ParentStudentLink, User } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Parents
router.get('/', requirePermission('parent.view'), (req: AuthenticatedRequest, res) => {
  const parents = db.parents.filter((p) => p.institute_id === req.institute_id && !p.is_deleted);
  
  const populated = parents.map((p) => {
    const user = db.findUserById(p.user_id);
    const children = db.getChildrenForParent(p.id);
    return {
      ...p,
      email: user?.email,
      phone: user?.phone,
      children
    };
  });

  return sendSuccess(res, populated);
});

// Create Parent & Link Students
router.post('/', requirePermission('parent.create'), async (req: AuthenticatedRequest, res) => {
  const { email, phone, password, full_name, cnic, occupation, address, student_ids } = req.body;

  if (!email || !full_name || !cnic) {
    return sendError(res, 'Email, full_name, and CNIC are required', 400);
  }

  const pwdHash = await hashPassword(password || 'Pass1234');
  const userId = `usr-prn-${Date.now()}`;

  const newUser: User = {
    id: userId,
    institute_id: req.institute_id!,
    email,
    phone: phone || '+923000000000',
    password_hash: pwdHash,
    full_name,
    role: 'parent',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: false,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.users.push(newUser);

  const parentId = `prn-${Date.now()}`;
  const newParent: ParentEntity = {
    id: parentId,
    institute_id: req.institute_id!,
    user_id: userId,
    full_name,
    cnic,
    occupation: occupation || 'Civil Servant',
    address: address || 'Islamabad, Pakistan',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.parents.push(newParent);

  // Link children if student_ids provided
  if (Array.isArray(student_ids)) {
    student_ids.forEach((stdId: string) => {
      const student = db.students.find((s) => s.id === stdId && s.institute_id === req.institute_id);
      if (student) {
        const link: ParentStudentLink = {
          id: `psl-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          institute_id: req.institute_id!,
          parent_id: parentId,
          student_id: stdId,
          relationship: 'FATHER',
          is_primary_contact: true,
          created_at: new Date().toISOString()
        };
        db.parentStudentLinks.push(link);
      }
    });
  }

  return sendSuccess(res, newParent, 'Parent created and linked successfully', 201);
});

// Link additional student to parent
router.post('/:id/link-student', requirePermission('parent.link'), (req: AuthenticatedRequest, res) => {
  const parent = db.parents.find((p) => p.id === req.params.id && p.institute_id === req.institute_id);
  if (!parent) return sendError(res, 'Parent not found', 404);

  const { student_id, relationship = 'GUARDIAN' } = req.body;
  const student = db.students.find((s) => s.id === student_id && s.institute_id === req.institute_id);
  if (!student) return sendError(res, 'Student not found in this institution', 404);

  const existingLink = db.parentStudentLinks.find((l) => l.parent_id === parent.id && l.student_id === student.id);
  if (existingLink) {
    return sendError(res, 'Relationship already exists between parent and student', 400);
  }

  const link: ParentStudentLink = {
    id: `psl-${Date.now()}`,
    institute_id: req.institute_id!,
    parent_id: parent.id,
    student_id: student.id,
    relationship: relationship as any,
    is_primary_contact: false,
    created_at: new Date().toISOString()
  };
  db.parentStudentLinks.push(link);

  return sendSuccess(res, link, 'Student successfully linked to parent');
});

export default router;
