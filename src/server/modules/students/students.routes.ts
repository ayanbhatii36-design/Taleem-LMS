import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { hashPassword } from '../../utils/password';
import { StudentEntity, User } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Students with pagination, filtering & search
router.get('/', requirePermission('student.view'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, status, search, page = '1', limit = '20' } = req.query;

  const filter: any = { institute_id: req.institute_id, is_deleted: { $ne: true } };

  // Role specific isolation: Student can only view themselves; Parent can only view linked children
  if (req.user?.role === 'student') {
    filter.user_id = req.user.id;
  } else if (req.user?.role === 'parent') {
    const parent = await repo.parents.findOne({ user_id: req.user.id, is_deleted: { $ne: true } });
    const links = parent ? await repo.parentStudentLinks.find({ parent_id: parent.id }) : [];
    const childIds = links.map((l) => l.student_id);
    filter.id = { $in: childIds };
  }

  if (class_id) {
    filter.class_id = class_id;
  }
  if (section_id) {
    filter.section_id = section_id;
  }
  if (status) {
    filter.status = status;
  }
  if (search) {
    const q = (search as string).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    filter.$or = [
      { full_name: { $regex: q, $options: 'i' } },
      { registration_no: { $regex: q, $options: 'i' } },
      { roll_no: { $regex: q, $options: 'i' } },
      { cnic_bform: { $regex: q, $options: 'i' } }
    ];
  }

  const filtered = await repo.students.find(filter);

  const p = parseInt(page as string, 10);
  const l = parseInt(limit as string, 10);
  const total = filtered.length;
  const total_pages = Math.ceil(total / l) || 1;
  const paginated = filtered.slice((p - 1) * l, p * l);

  const populated = await Promise.all(
    paginated.map(async (s) => {
      const cls = await repo.classes.findOne({ id: s.class_id });
      const sec = await repo.sections.findOne({ id: s.section_id });
      return {
        ...s,
        className: cls?.name || 'Class 10',
        sectionName: sec?.name || 'A'
      };
    })
  );

  return sendSuccess(res, populated, 'Students retrieved successfully', 200, undefined, {
    page: p,
    limit: l,
    total,
    total_pages
  });
});

// Get Student By ID with Academic History
router.get('/:id', requirePermission('student.view'), async (req: AuthenticatedRequest, res) => {
  const student = await repo.students.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!student) return sendError(res, 'Student not found', 404);

  // Authorization check
  if (req.user?.role === 'student' && student.user_id !== req.user.id) {
    return sendError(res, 'Unauthorized access to student record', 403, 'FORBIDDEN');
  }

  const attendance = await repo.attendance.find({ student_id: student.id });
  const grades = await repo.gradeRecords.find({ student_id: student.id });
  const invoices = await repo.invoices.find({ student_id: student.id });

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

  const existingUser = await repo.users.findOne({ email: email.toLowerCase() });
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
  await repo.users.insertOne(newUser);

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
    academic_year_id: academic_year_id || (await repo.academicYears.findOne({}))?.id || 'ay-01',
    guardian_name: guardian_name || 'Guardian',
    guardian_phone: guardian_phone || '+923000000000',
    guardian_relation: guardian_relation || 'Father',
    address: address || 'Islamabad, Pakistan',
    status: 'ACTIVE',
    admission_date: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  const createdStudent = await repo.students.insertOne(newStudent);

  await repo.auditLogs.insertOne({
    institute_id: req.institute_id!,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    user_role: req.user!.role,
    action: 'CREATE_STUDENT',
    target_resource: 'STUDENT',
    target_id: studentId,
    ip_address: req.ip
  });

  return sendSuccess(res, createdStudent, 'Student created successfully', 201);
});

// Transfer Class / Section
router.post('/:id/transfer', requirePermission('student.transfer'), async (req: AuthenticatedRequest, res) => {
  const student = await repo.students.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!student) return sendError(res, 'Student not found', 404);

  const { target_class_id, target_section_id } = req.body;
  if (!target_class_id || !target_section_id) {
    return sendError(res, 'target_class_id and target_section_id are required', 400);
  }

  const updated = await repo.students.updateOne(
    { id: student.id },
    { class_id: target_class_id, section_id: target_section_id }
  );

  await repo.auditLogs.insertOne({
    institute_id: req.institute_id!,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    user_role: req.user!.role,
    action: 'TRANSFER_STUDENT_CLASS',
    target_resource: 'STUDENT',
    target_id: student.id,
    ip_address: req.ip,
    metadata_json: JSON.stringify({ target_class_id, target_section_id })
  });

  return sendSuccess(res, updated, 'Student transferred successfully');
});

// Archive / Delete Student
router.delete('/:id', requirePermission('student.delete'), async (req: AuthenticatedRequest, res) => {
  const student = await repo.students.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!student) return sendError(res, 'Student not found', 404);

  await repo.students.updateOne(
    { id: student.id },
    { is_deleted: true, deleted_at: new Date().toISOString(), status: 'ARCHIVED' }
  );

  return sendSuccess(res, null, 'Student record archived');
});

export default router;