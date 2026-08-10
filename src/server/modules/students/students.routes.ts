import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { hashPassword } from '../../utils/password';
import { StudentEntity, User } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Students with pagination, filtering & search
router.get('/', requirePermission('student.view'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, status, search, page = '1', limit = '20' } = req.query;

  let filtered = db.students.filter((s) => s.institute_id === req.institute_id && !s.is_deleted);

  // Role specific isolation: Student can only view themselves; Parent can only view linked children
  if (req.user?.role === 'student') {
    filtered = filtered.filter((s) => s.user_id === req.user?.id);
  } else if (req.user?.role === 'parent') {
    const parent = db.findParentByUserId(req.user.id);
    const linkedChildren = parent ? db.getChildrenForParent(parent.id) : [];
    const childIds = linkedChildren.map((c) => c.id);
    filtered = filtered.filter((s) => childIds.includes(s.id));
  }

  if (class_id) {
    filtered = filtered.filter((s) => s.class_id === class_id);
  }
  if (section_id) {
    filtered = filtered.filter((s) => s.section_id === section_id);
  }
  if (status) {
    filtered = filtered.filter((s) => s.status === status);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(
      (s) =>
        s.full_name.toLowerCase().includes(q) ||
        s.registration_no.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q) ||
        s.cnic_bform.toLowerCase().includes(q)
    );
  }

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);
  const total = filtered.length;
  const total_pages = Math.ceil(total / l) || 1;
  const paginated = filtered.slice((p - 1) * l, p * l);

  const populated = paginated.map((s) => {
    const cls = db.classes.find((c) => c.id === s.class_id);
    const sec = db.sections.find((sec) => sec.id === s.section_id);
    return {
      ...s,
      className: cls?.name || 'Class 10',
      sectionName: sec?.name || 'A'
    };
  });

  return sendSuccess(res, populated, 'Students retrieved successfully', 200, undefined, {
    page: p,
    limit: l,
    total,
    total_pages
  });
});

// Get Student By ID with Academic History
router.get('/:id', requirePermission('student.view'), (req: AuthenticatedRequest, res) => {
  const student = db.students.find((s) => s.id === req.params.id && s.institute_id === req.institute_id);
  if (!student) return sendError(res, 'Student not found', 404);

  // Authorization check
  if (req.user?.role === 'student' && student.user_id !== req.user.id) {
    return sendError(res, 'Unauthorized access to student record', 403, 'FORBIDDEN');
  }

  const attendance = db.attendance.filter((a) => a.student_id === student.id);
  const grades = db.gradeRecords.filter((g) => g.student_id === student.id);
  const invoices = db.invoices.filter((inv) => inv.student_id === student.id);

  const totalAtt = attendance.length;
  const presentCount = attendance.filter((a) => a.status === 'PRESENT').length;
  const attendancePct = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 100;

  return sendSuccess(res, {
    student,
    academicSummary: {
      attendancePct,
      totalAttendanceDays: totalAtt,
      grades,
      invoices
    }
  });
});

// Create Student (Creates User + Student record)
router.post('/', requirePermission('student.create'), async (req: AuthenticatedRequest, res) => {
  const {
    email,
    phone,
    password,
    full_name,
    gender,
    dob,
    cnic_bform,
    class_id,
    section_id,
    academic_year_id,
    guardian_name,
    guardian_phone,
    guardian_relation,
    address
  } = req.body;

  if (!email || !full_name || !class_id || !section_id) {
    return sendError(res, 'Email, full name, class_id, and section_id are required', 400);
  }

  const existingUser = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return sendError(res, 'User with this email already exists', 400);
  }

  const pwdHash = await hashPassword(password || 'Pass1234');

  const userId = `usr-std-${Date.now()}`;
  const newUser: User = {
    id: userId,
    institute_id: req.institute_id!,
    email,
    phone: phone || '+923000000000',
    password_hash: pwdHash,
    full_name,
    role: 'student',
    is_active: true,
    is_email_verified: true,
    is_phone_verified: false,
    two_factor_enabled: false,
    failed_login_attempts: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.users.push(newUser);

  const studentId = `std-${Date.now()}`;
  const newStudent: StudentEntity = {
    id: studentId,
    institute_id: req.institute_id!,
    user_id: userId,
    registration_no: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
    roll_no: `${Math.floor(100 + Math.random() * 900)}`,
    full_name,
    gender: gender || 'MALE',
    dob: dob || '2009-01-01',
    cnic_bform: cnic_bform || '61101-0000000-1',
    class_id,
    section_id,
    academic_year_id: academic_year_id || db.academicYears[0]?.id || 'ay-01',
    guardian_name: guardian_name || 'Guardian',
    guardian_phone: guardian_phone || '+923000000000',
    guardian_relation: guardian_relation || 'Father',
    address: address || 'Islamabad, Pakistan',
    status: 'ACTIVE',
    admission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  db.students.push(newStudent);

  db.logAudit(req.institute_id!, req.user!.id, req.user!.full_name, req.user!.role, 'CREATE_STUDENT', 'STUDENT', studentId);

  return sendSuccess(res, newStudent, 'Student created successfully', 201);
});

// Transfer Class / Section
router.post('/:id/transfer', requirePermission('student.transfer'), (req: AuthenticatedRequest, res) => {
  const student = db.students.find((s) => s.id === req.params.id && s.institute_id === req.institute_id);
  if (!student) return sendError(res, 'Student not found', 404);

  const { target_class_id, target_section_id } = req.body;
  if (!target_class_id || !target_section_id) {
    return sendError(res, 'target_class_id and target_section_id are required', 400);
  }

  student.class_id = target_class_id;
  student.section_id = target_section_id;
  student.updated_at = new Date().toISOString();

  db.logAudit(
    req.institute_id!,
    req.user!.id,
    req.user!.full_name,
    req.user!.role,
    'TRANSFER_STUDENT_CLASS',
    'STUDENT',
    student.id,
    req.ip,
    { target_class_id, target_section_id }
  );

  return sendSuccess(res, student, 'Student transferred successfully');
});

// Archive / Delete Student
router.delete('/:id', requirePermission('student.delete'), (req: AuthenticatedRequest, res) => {
  const student = db.students.find((s) => s.id === req.params.id && s.institute_id === req.institute_id);
  if (!student) return sendError(res, 'Student not found', 404);

  student.is_deleted = true;
  student.deleted_at = new Date().toISOString();
  student.status = 'ARCHIVED';

  return sendSuccess(res, null, 'Student record archived');
});

export default router;
