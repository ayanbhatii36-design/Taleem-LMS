import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { hashPassword } from '../../utils/password';
import { TeacherEntity, User } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Teachers
router.get('/', requirePermission('teacher.view'), async (req: AuthenticatedRequest, res) => {
  const teachers = await repo.teachers.find({ institute_id: req.institute_id, is_deleted: { $ne: true } });

  const populated = await Promise.all(
    teachers.map(async (t) => {
      const user = await repo.users.findOne({ id: t.user_id });
      const assignedSlots = await repo.timetableSlots.find({ teacher_id: t.user_id });
      return {
        ...t,
        email: user?.email,
        phone: user?.phone,
        assignedClassesCount: new Set(assignedSlots.map((s) => s.class_id)).size,
        weeklyLecturesCount: assignedSlots.length
      };
    })
  );

  return sendSuccess(res, populated);
});

// Create Teacher
router.post('/', requirePermission('teacher.create'), async (req: AuthenticatedRequest, res) => {
  const { email, phone, password, full_name, designation, qualification, specialization, emp_id } = req.body;
  if (!email || !full_name) {
    return sendError(res, 'Email and full_name are required', 400);
  }

  const existingUser = await repo.users.findOne({ email: email.toLowerCase() });
  if (existingUser) return sendError(res, 'Email already in use', 400);

  const pwdHash = await hashPassword(password || 'Pass1234');
  const userId = `usr-tch-${Date.now()}`;

  const newUser: User = {
    id: userId,
    institute_id: req.institute_id!,
    email,
    phone: phone || '+923000000000',
    password_hash: pwdHash,
    full_name,
    role: 'teacher',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: false,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.users.insertOne(newUser);

  const teacherId = `tch-${Date.now()}`;
  const newTeacher: TeacherEntity = {
    id: teacherId,
    institute_id: req.institute_id!,
    user_id: userId,
    emp_id: emp_id || `TCH-${Math.floor(100 + Math.random() * 900)}`,
    full_name,
    designation: designation || 'Lecturer',
    qualification: qualification || 'M.Sc',
    specialization: specialization || 'General Science',
    joining_date: new Date().toISOString().slice(0, 10),
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const createdTeacher = await repo.teachers.insertOne(newTeacher);

  await repo.auditLogs.insertOne({
    institute_id: req.institute_id!,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    user_role: req.user!.role,
    action: 'CREATE_TEACHER',
    target_resource: 'TEACHER',
    target_id: teacherId,
    ip_address: req.ip
  });

  return sendSuccess(res, createdTeacher, 'Teacher created successfully', 201);
});

// Delete / Archive Teacher
router.delete('/:id', requirePermission('teacher.delete'), async (req: AuthenticatedRequest, res) => {
  const teacher = await repo.teachers.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!teacher) return sendError(res, 'Teacher not found', 404);

  await repo.teachers.updateOne(
    { id: teacher.id },
    { is_deleted: true, deleted_at: new Date().toISOString(), status: 'RESIGNED' }
  );

  return sendSuccess(res, null, 'Teacher record archived');
});

export default router;