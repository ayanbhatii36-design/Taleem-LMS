export type SystemRole = 
  | 'super_admin'
  | 'principal'
  | 'administrator'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'staff';

export type Permission =
  // Institute
  | 'institute.view' | 'institute.create' | 'institute.edit' | 'institute.delete'
  // Users
  | 'user.view' | 'user.create' | 'user.edit' | 'user.delete'
  // Students
  | 'student.view' | 'student.create' | 'student.edit' | 'student.delete' | 'student.archive' | 'student.transfer'
  // Teachers
  | 'teacher.view' | 'teacher.create' | 'teacher.edit' | 'teacher.delete' | 'teacher.assign'
  // Parents
  | 'parent.view' | 'parent.create' | 'parent.edit' | 'parent.delete' | 'parent.link'
  // Academics
  | 'academics.view' | 'academics.manage'
  // Attendance
  | 'attendance.view' | 'attendance.create' | 'attendance.edit' | 'attendance.report'
  // LMS & Assignments
  | 'lms.view' | 'lms.create' | 'lms.edit' | 'lms.delete' | 'assignment.submit' | 'assignment.grade'
  // Exams & Grades
  | 'exam.view' | 'exam.create' | 'exam.edit' | 'exam.delete'
  | 'grades.view' | 'grades.create' | 'grades.edit'
  // Timetable
  | 'timetable.view' | 'timetable.manage'
  // Fees & Payments
  | 'fees.view' | 'fees.create' | 'fees.edit' | 'fees.collect' | 'fees.refund'
  // Communication
  | 'announcement.view' | 'announcement.create'
  | 'message.send' | 'message.view'
  // Reports
  | 'reports.view' | 'reports.export'
  // Audit Logs
  | 'audit.view';

export interface BaseEntity {
  id: string;
  institute_id: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Institute {
  id: string;
  name: string;
  code: string;
  domain?: string;
  logo_url?: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  province: string;
  country: string;
  grading_scheme_type: 'PERCENTAGE' | 'LETTER' | 'GPA' | 'MARKS';
  currency: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  institute_id: string;
  email: string;
  phone: string;
  password_hash: string;
  full_name: string;
  role: SystemRole;
  is_active: boolean;
  is_email_verified: boolean;
  is_phone_verified: boolean;
  two_factor_enabled: boolean;
  failed_login_attempts: number;
  lockout_until?: string | null;
  last_login_at?: string | null;
  avatar_url?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentEntity extends BaseEntity {
  user_id: string;
  registration_no: string;
  roll_no: string;
  full_name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  cnic_bform: string;
  class_id: string;
  section_id: string;
  academic_year_id: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_relation: string;
  address: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'GRADUATED' | 'TRANSFERRED';
  admission_date: string;
}

export interface TeacherEntity extends BaseEntity {
  user_id: string;
  emp_id: string;
  full_name: string;
  designation: string;
  qualification: string;
  department_id?: string;
  specialization: string;
  joining_date: string;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED';
}

export interface ParentEntity extends BaseEntity {
  user_id: string;
  full_name: string;
  cnic: string;
  occupation: string;
  address: string;
  secondary_phone?: string;
}

export interface ParentStudentLink {
  id: string;
  institute_id: string;
  parent_id: string;
  student_id: string;
  relationship: 'FATHER' | 'MOTHER' | 'GUARDIAN';
  is_primary_contact: boolean;
  created_at: string;
}

export interface AcademicYear extends BaseEntity {
  name: string; // e.g. "2025-2026"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface Term extends BaseEntity {
  academic_year_id: string;
  name: string; // e.g., "Term 1"
  start_date: string;
  end_date: string;
  is_current: boolean;
}

export interface ClassEntity extends BaseEntity {
  name: string; // e.g., "Class 10"
  code: string;
  level_order: number;
}

export interface SectionEntity extends BaseEntity {
  class_id: string;
  name: string; // e.g., "A"
  capacity: number;
  class_teacher_id?: string;
}

export interface SubjectEntity extends BaseEntity {
  name: string; // e.g. "Physics"
  code: string; // e.g. "PHY-10"
  type: 'THEORY' | 'PRACTICAL' | 'BOTH';
  credit_hours: number;
}

export interface ClassSubjectAssignment extends BaseEntity {
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  academic_year_id: string;
}

export interface CourseEntity extends BaseEntity {
  title: string;
  code: string;
  subject_id: string;
  class_id: string;
  teacher_id: string;
  description: string;
  thumbnail_url?: string;
}

export interface AttendanceRecord extends BaseEntity {
  student_id: string;
  class_id: string;
  section_id: string;
  date: string;
  status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
  remarks?: string;
  marked_by_user_id: string;
}

export interface AssignmentEntity extends BaseEntity {
  title: string;
  description: string;
  course_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  teacher_id: string;
  due_date: string;
  total_marks: number;
  allowed_file_types: string[];
  max_file_size_mb: number;
  allow_late_submission: boolean;
}

export interface SubmissionEntity extends BaseEntity {
  assignment_id: string;
  student_id: string;
  submission_date: string;
  file_url: string;
  file_name: string;
  file_type: string;
  notes?: string;
  status: 'SUBMITTED' | 'GRADED' | 'LATE';
  grade_obtained?: number;
  feedback?: string;
  graded_by_user_id?: string;
  graded_at?: string;
}

export interface ExamEntity extends BaseEntity {
  title: string;
  term_id: string;
  academic_year_id: string;
  start_date: string;
  end_date: string;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'PUBLISHED';
}

export interface ExamSubjectEntity extends BaseEntity {
  exam_id: string;
  class_id: string;
  section_id: string;
  subject_id: string;
  exam_date: string;
  start_time: string;
  duration_minutes: number;
  total_marks: number;
  passing_marks: number;
  room_name: string;
}

export interface GradeRecordEntity extends BaseEntity {
  exam_subject_id: string;
  student_id: string;
  marks_obtained: number;
  total_marks: number;
  grade_letter?: string;
  gpa_points?: number;
  remarks?: string;
  entered_by_user_id: string;
}

export interface TimetableSlotEntity extends BaseEntity {
  class_id: string;
  section_id: string;
  day_of_week: 'MONDAY' | 'TUESDAY' | 'WEDNESDAY' | 'THURSDAY' | 'FRIDAY' | 'SATURDAY';
  start_time: string; // e.g. "08:00"
  end_time: string; // e.g. "08:45"
  subject_id: string;
  teacher_id: string;
  room_name: string;
}

export interface FeeStructure extends BaseEntity {
  title: string;
  class_id: string;
  amount_pkr: number;
  frequency: 'MONTHLY' | 'TERM' | 'ANNUAL' | 'ONE_TIME';
  due_day_of_month: number;
  late_fee_fine_pkr: number;
}

export interface InvoiceEntity extends BaseEntity {
  invoice_no: string;
  student_id: string;
  class_id: string;
  fee_structure_id?: string;
  title: string;
  amount_pkr: number;
  discount_pkr: number;
  net_amount_pkr: number;
  paid_amount_pkr: number;
  due_date: string;
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  issue_date: string;
}

export interface PaymentRecord extends BaseEntity {
  invoice_id: string;
  receipt_no: string;
  amount_pkr: number;
  payment_method: 'CASH' | 'BANK_TRANSFER' | 'ONLINE_CARD' | 'JAZZCASH' | 'EASYPAISA';
  transaction_ref?: string;
  paid_date: string;
  recorded_by_user_id: string;
  notes?: string;
}

export interface AnnouncementEntity extends BaseEntity {
  title: string;
  content: string;
  target_roles: SystemRole[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  author_id: string;
  author_name: string;
}

export interface MessageEntity {
  id: string;
  institute_id: string;
  conversation_id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  attachment_url?: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationEntity {
  id: string;
  institute_id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'ATTENDANCE' | 'ASSIGNMENT' | 'EXAM' | 'FEE' | 'ANNOUNCEMENT' | 'MESSAGE' | 'SYSTEM';
  is_read: boolean;
  link_url?: string;
  created_at: string;
}

export interface AuditLogEntity {
  id: string;
  institute_id: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  target_resource: string;
  target_id?: string;
  ip_address?: string;
  metadata_json?: string;
  created_at: string;
}

// API Envelope standard response
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  pagination?: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
  meta?: Record<string, any>;
}

export interface AuthSession {
  user: {
    id: string;
    institute_id: string;
    email: string;
    phone: string;
    full_name: string;
    role: SystemRole;
    permissions: Permission[];
    institute_name?: string;
  };
  token: string;
  refreshToken: string;
}
