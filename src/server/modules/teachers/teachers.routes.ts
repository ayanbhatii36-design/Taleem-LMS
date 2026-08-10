import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { hashPassword } from '../../utils/password';
import { TeacherEntity, User } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Teachers
router.get('/', requirePermission('teacher.view'), (req: AuthenticatedRequest, res) => {
  const teachers = db.teachers.filter((t) => t.institute_id === req.institute_id && !t.is_deleted);
  
  const populated = teachers.map((t) => {
    const user = db.findUserById(t.user_id);
    const assignedSlots = db.timetableSlots.filter((slot) => slot.teacher_id === t.user_id);
    return {
      ...t,
      email: user?.email,
      phone: user?.phone,
      assignedClassesCount: new Set(assignedSlots.map((s) => s.class_id)).size,
      weeklyLecturesCount: assignedSlots.length
    };
  });

  return sendSuccess(res, populated);
});

// Create Teacher
router.post('/', requirePermission('teacher.create'), async (req: AuthenticatedRequest, res) => {
  const { email, phone, password, full_name, designation, qualification, specialization, emp_id } = req.body;
  if (!email || !full_name) {
    return sendError(res, 'Email and full_name are required', 400);
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
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
  db.users.push(newUser);

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
  db.teachers.push(newTeacher);

  db.logAudit(req.institute_id!, req.user!.id, req.user!.full_name, req.user!.role, 'CREATE_TEACHER', 'TEACHER', teacherId);

  return sendSuccess(res, newTeacher, 'Teacher created successfully', 201);
});

export default router;
