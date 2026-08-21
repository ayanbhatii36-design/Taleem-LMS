import { Schema } from 'mongoose';

/**
 * TaleemLMS MongoDB schemas.
 * Field names intentionally mirror the SQL schema (snake_case) and the
 * TypeScript entity interfaces in ../types/backend.ts.
 * `id` is the business primary key used across the app; mongoose `_id`
 * is auto-generated and mapped back to `id` by the repository layer.
 */

const baseFields = {
  institute_id: { type: String, required: true, index: true },
  created_at: { type: String, default: () => new Date().toISOString() },
  updated_at: { type: String, default: () => new Date().toISOString() },
  is_deleted: { type: Boolean, default: false },
  deleted_at: { type: String, default: null }
};

const idField = { id: { type: String, required: true, unique: true } };

// ---------------------------------------------------------------- Institutes
// A tenant institute is the root entity — it has no parent institute_id.
export const instituteSchema = new Schema({
  ...idField,
  ...baseFields,
  institute_id: { type: String, default: null },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  domain: { type: String, default: '' },
  logo_url: { type: String, default: '' },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, default: '' },
  city: { type: String, default: 'Islamabad' },
  province: { type: String, default: 'Federal' },
  country: { type: String, default: 'Pakistan' },
  grading_scheme_type: { type: String, enum: ['PERCENTAGE', 'LETTER', 'GPA', 'MARKS'], default: 'PERCENTAGE' },
  currency: { type: String, default: 'PKR' },
  is_active: { type: Boolean, default: true }
}, { versionKey: false });

// -------------------------------------------------------------------- Users
export const userSchema = new Schema({
  ...idField,
  ...baseFields,
  email: { type: String, required: true },
  phone: { type: String, required: true },
  password_hash: { type: String, required: true },
  full_name: { type: String, required: true },
  role: { type: String, enum: ['super_admin', 'principal', 'administrator', 'teacher', 'student', 'parent', 'accountant', 'staff'], required: true },
  is_active: { type: Boolean, default: true },
  is_email_verified: { type: Boolean, default: false },
  is_phone_verified: { type: Boolean, default: false },
  two_factor_enabled: { type: Boolean, default: false },
  failed_login_attempts: { type: Number, default: 0 },
  lockout_until: { type: String, default: null },
  last_login_at: { type: String, default: null },
  avatar_url: { type: String, default: '' }
}, { versionKey: false });

userSchema.index({ institute_id: 1, email: 1 }, { unique: true });
userSchema.index({ institute_id: 1, phone: 1 }, { unique: true });
userSchema.index({ institute_id: 1, role: 1 });

// ---------------------------------------------------------------- Students
export const studentSchema = new Schema({
  ...idField,
  ...baseFields,
  user_id: { type: String, required: true, index: true },
  registration_no: { type: String, required: true },
  roll_no: { type: String, required: true },
  full_name: { type: String, required: true },
  gender: { type: String, enum: ['MALE', 'FEMALE', 'OTHER'], default: 'MALE' },
  dob: { type: String, required: true },
  cnic_bform: { type: String, required: true },
  class_id: { type: String, required: true },
  section_id: { type: String, required: true },
  academic_year_id: { type: String, required: true },
  guardian_name: { type: String, required: true },
  guardian_phone: { type: String, required: true },
  guardian_relation: { type: String, default: 'FATHER' },
  address: { type: String, default: '' },
  status: { type: String, enum: ['ACTIVE', 'ARCHIVED', 'GRADUATED', 'TRANSFERRED'], default: 'ACTIVE' },
  admission_date: { type: String, default: () => new Date().toISOString().slice(0, 10) }
}, { versionKey: false });

studentSchema.index({ institute_id: 1, registration_no: 1 }, { unique: true });
studentSchema.index({ institute_id: 1, class_id: 1, section_id: 1 });

// ---------------------------------------------------------------- Teachers
export const teacherSchema = new Schema({
  ...idField,
  ...baseFields,
  user_id: { type: String, required: true, unique: true },
  emp_id: { type: String, required: true },
  full_name: { type: String, required: true },
  designation: { type: String, default: 'Senior Teacher' },
  qualification: { type: String, default: 'M.Sc' },
  department_id: { type: String, default: '' },
  specialization: { type: String, default: '' },
  joining_date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  status: { type: String, enum: ['ACTIVE', 'ON_LEAVE', 'RESIGNED'], default: 'ACTIVE' }
}, { versionKey: false });

teacherSchema.index({ institute_id: 1, emp_id: 1 }, { unique: true });

// ----------------------------------------------------------------- Parents
export const parentSchema = new Schema({
  ...idField,
  ...baseFields,
  user_id: { type: String, required: true, unique: true },
  full_name: { type: String, required: true },
  cnic: { type: String, required: true },
  occupation: { type: String, default: '' },
  address: { type: String, default: '' },
  secondary_phone: { type: String, default: '' }
}, { versionKey: false });

export const parentStudentLinkSchema = new Schema({
  ...idField,
  ...baseFields,
  parent_id: { type: String, required: true, index: true },
  student_id: { type: String, required: true, index: true },
  relationship: { type: String, enum: ['FATHER', 'MOTHER', 'GUARDIAN'], default: 'FATHER' },
  is_primary_contact: { type: Boolean, default: true }
}, { versionKey: false });

parentStudentLinkSchema.index({ parent_id: 1, student_id: 1 }, { unique: true });

// ----------------------------------------------------------- Academic years
export const academicYearSchema = new Schema({
  ...idField,
  ...baseFields,
  name: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  is_current: { type: Boolean, default: false }
}, { versionKey: false });

export const termSchema = new Schema({
  ...idField,
  ...baseFields,
  academic_year_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  is_current: { type: Boolean, default: false }
}, { versionKey: false });

// ------------------------------------------------------- Classes & sections
export const classSchema = new Schema({
  ...idField,
  ...baseFields,
  name: { type: String, required: true },
  code: { type: String, required: true },
  level_order: { type: Number, default: 1 }
}, { versionKey: false });

export const sectionSchema = new Schema({
  ...idField,
  ...baseFields,
  class_id: { type: String, required: true, index: true },
  name: { type: String, required: true },
  capacity: { type: Number, default: 40 },
  class_teacher_id: { type: String, default: '' }
}, { versionKey: false });

sectionSchema.index({ class_id: 1, name: 1 }, { unique: true });

// ------------------------------------------------- Subjects & courses (LMS)
export const subjectSchema = new Schema({
  ...idField,
  ...baseFields,
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['THEORY', 'PRACTICAL', 'BOTH'], default: 'THEORY' },
  credit_hours: { type: Number, default: 3 }
}, { versionKey: false });

export const courseSchema = new Schema({
  ...idField,
  ...baseFields,
  title: { type: String, required: true },
  code: { type: String, required: true },
  subject_id: { type: String, required: true },
  class_id: { type: String, required: true },
  teacher_id: { type: String, required: true },
  description: { type: String, default: '' },
  thumbnail_url: { type: String, default: '' }
}, { versionKey: false });

export const classSubjectAssignmentSchema = new Schema({
  ...idField,
  ...baseFields,
  class_id: { type: String, required: true },
  section_id: { type: String, required: true },
  subject_id: { type: String, required: true },
  teacher_id: { type: String, required: true },
  academic_year_id: { type: String, required: true }
}, { versionKey: false });

// -------------------------------------------------------------- Attendance
export const attendanceSchema = new Schema({
  ...idField,
  ...baseFields,
  student_id: { type: String, required: true, index: true },
  class_id: { type: String, required: true },
  section_id: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'], required: true },
  remarks: { type: String, default: '' },
  marked_by_user_id: { type: String, required: true }
}, { versionKey: false });

attendanceSchema.index({ institute_id: 1, student_id: 1, date: 1 }, { unique: true });
attendanceSchema.index({ institute_id: 1, class_id: 1, section_id: 1, date: 1 });

// ------------------------------------------------------------- LMS module
export const assignmentSchema = new Schema({
  ...idField,
  ...baseFields,
  title: { type: String, required: true },
  description: { type: String, required: true },
  course_id: { type: String, default: '' },
  class_id: { type: String, required: true },
  section_id: { type: String, required: true },
  subject_id: { type: String, required: true },
  teacher_id: { type: String, required: true },
  due_date: { type: String, required: true },
  total_marks: { type: Number, default: 100 },
  allowed_file_types: { type: [String], default: ['pdf', 'docx', 'jpg'] },
  max_file_size_mb: { type: Number, default: 10 },
  allow_late_submission: { type: Boolean, default: true }
}, { versionKey: false });

export const submissionSchema = new Schema({
  ...idField,
  ...baseFields,
  assignment_id: { type: String, required: true, index: true },
  student_id: { type: String, required: true, index: true },
  submission_date: { type: String, default: () => new Date().toISOString() },
  file_url: { type: String, required: true },
  file_name: { type: String, required: true },
  file_type: { type: String, required: true },
  notes: { type: String, default: '' },
  status: { type: String, enum: ['SUBMITTED', 'GRADED', 'LATE'], default: 'SUBMITTED' },
  grade_obtained: { type: Number, default: null },
  feedback: { type: String, default: '' },
  graded_by_user_id: { type: String, default: '' },
  graded_at: { type: String, default: '' }
}, { versionKey: false });

submissionSchema.index({ assignment_id: 1, student_id: 1 }, { unique: true });

// ----------------------------------------------------------- Exams & grades
export const examSchema = new Schema({
  ...idField,
  ...baseFields,
  title: { type: String, required: true },
  term_id: { type: String, required: true },
  academic_year_id: { type: String, required: true },
  start_date: { type: String, required: true },
  end_date: { type: String, required: true },
  status: { type: String, enum: ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'PUBLISHED'], default: 'SCHEDULED' }
}, { versionKey: false });

export const examSubjectSchema = new Schema({
  ...idField,
  ...baseFields,
  exam_id: { type: String, required: true, index: true },
  class_id: { type: String, required: true },
  section_id: { type: String, required: true },
  subject_id: { type: String, required: true },
  exam_date: { type: String, required: true },
  start_time: { type: String, required: true },
  duration_minutes: { type: Number, default: 120 },
  total_marks: { type: Number, default: 100 },
  passing_marks: { type: Number, default: 33 },
  room_name: { type: String, default: 'Main Hall' }
}, { versionKey: false });

export const gradeRecordSchema = new Schema({
  ...idField,
  ...baseFields,
  exam_subject_id: { type: String, required: true, index: true },
  student_id: { type: String, required: true, index: true },
  marks_obtained: { type: Number, required: true },
  total_marks: { type: Number, default: 100 },
  grade_letter: { type: String, default: '' },
  gpa_points: { type: Number, default: null },
  remarks: { type: String, default: '' },
  entered_by_user_id: { type: String, required: true }
}, { versionKey: false });

gradeRecordSchema.index({ exam_subject_id: 1, student_id: 1 }, { unique: true });

// --------------------------------------------------------------- Timetable
export const timetableSlotSchema = new Schema({
  ...idField,
  ...baseFields,
  class_id: { type: String, required: true, index: true },
  section_id: { type: String, required: true },
  day_of_week: { type: String, enum: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'], required: true },
  start_time: { type: String, required: true },
  end_time: { type: String, required: true },
  subject_id: { type: String, required: true },
  teacher_id: { type: String, required: true },
  room_name: { type: String, default: '' }
}, { versionKey: false });

// -------------------------------------------------------------------- Fees
export const feeStructureSchema = new Schema({
  ...idField,
  ...baseFields,
  title: { type: String, required: true },
  class_id: { type: String, required: true },
  amount_pkr: { type: Number, required: true },
  frequency: { type: String, enum: ['MONTHLY', 'TERM', 'ANNUAL', 'ONE_TIME'], default: 'MONTHLY' },
  due_day_of_month: { type: Number, default: 10 },
  late_fee_fine_pkr: { type: Number, default: 500 }
}, { versionKey: false });

export const invoiceSchema = new Schema({
  ...idField,
  ...baseFields,
  invoice_no: { type: String, required: true },
  student_id: { type: String, required: true, index: true },
  class_id: { type: String, required: true },
  fee_structure_id: { type: String, default: '' },
  title: { type: String, required: true },
  amount_pkr: { type: Number, required: true },
  discount_pkr: { type: Number, default: 0 },
  net_amount_pkr: { type: Number, required: true },
  paid_amount_pkr: { type: Number, default: 0 },
  issue_date: { type: String, default: () => new Date().toISOString().slice(0, 10) },
  due_date: { type: String, required: true },
  status: { type: String, enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED'], default: 'UNPAID' }
}, { versionKey: false });

invoiceSchema.index({ institute_id: 1, invoice_no: 1 }, { unique: true });

export const paymentSchema = new Schema({
  ...idField,
  ...baseFields,
  invoice_id: { type: String, required: true, index: true },
  receipt_no: { type: String, required: true },
  amount_pkr: { type: Number, required: true },
  payment_method: { type: String, enum: ['CASH', 'BANK_TRANSFER', 'ONLINE_CARD', 'JAZZCASH', 'EASYPAISA'], default: 'CASH' },
  transaction_ref: { type: String, default: '' },
  paid_date: { type: String, default: () => new Date().toISOString() },
  recorded_by_user_id: { type: String, required: true },
  notes: { type: String, default: '' }
}, { versionKey: false });

paymentSchema.index({ institute_id: 1, receipt_no: 1 }, { unique: true });

// ----------------------------------------------------------- Communication
export const announcementSchema = new Schema({
  ...idField,
  ...baseFields,
  title: { type: String, required: true },
  content: { type: String, required: true },
  target_roles: { type: [String], default: [] },
  priority: { type: String, enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'], default: 'NORMAL' },
  author_id: { type: String, required: true },
  author_name: { type: String, required: true }
}, { versionKey: false });

export const messageSchema = new Schema({
  ...idField,
  ...baseFields,
  conversation_id: { type: String, required: true, index: true },
  sender_id: { type: String, required: true, index: true },
  recipient_id: { type: String, required: true, index: true },
  content: { type: String, required: true },
  attachment_url: { type: String, default: '' },
  is_read: { type: Boolean, default: false }
}, { versionKey: false });

export const notificationSchema = new Schema({
  ...idField,
  ...baseFields,
  user_id: { type: String, required: true, index: true },
  title: { type: String, required: true },
  body: { type: String, required: true },
  type: { type: String, enum: ['ATTENDANCE', 'ASSIGNMENT', 'EXAM', 'FEE', 'ANNOUNCEMENT', 'MESSAGE', 'SYSTEM'], default: 'SYSTEM' },
  is_read: { type: Boolean, default: false },
  link_url: { type: String, default: '' }
}, { versionKey: false });

// -------------------------------------------------------------- Audit logs
export const auditLogSchema = new Schema({
  ...idField,
  ...baseFields,
  user_id: { type: String, required: true },
  user_name: { type: String, required: true },
  user_role: { type: String, required: true },
  action: { type: String, required: true },
  target_resource: { type: String, required: true },
  target_id: { type: String, default: '' },
  ip_address: { type: String, default: '' },
  metadata_json: { type: String, default: '' }
}, { versionKey: false });

auditLogSchema.index({ institute_id: 1, created_at: -1 });

// ------------------------------------------------------------ File metadata
export const fileMetadataSchema = new Schema({
  ...idField,
  ...baseFields,
  uploaded_by_user_id: { type: String, required: true },
  original_name: { type: String, required: true },
  mime_type: { type: String, required: true },
  size_bytes: { type: Number, required: true },
  file_path: { type: String, required: true },
  public_url: { type: String, required: true },
  module: { type: String, required: true }
}, { versionKey: false });