import { repo } from './repository';
import { hashPassword } from '../utils/password';
import {
  Institute,
  User,
  StudentEntity,
  TeacherEntity,
  ParentEntity,
  ParentStudentLink,
  AcademicYear,
  Term,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  CourseEntity,
  AssignmentEntity,
  ExamEntity,
  ExamSubjectEntity,
  GradeRecordEntity,
  TimetableSlotEntity,
  FeeStructure,
  InvoiceEntity,
  PaymentRecord,
  AnnouncementEntity,
  NotificationEntity
} from '../types/backend';

export async function seedDatabase() {
  if (await repo.institutes.isSeeded()) return; // already seeded (mongo or memory)

  console.log('[SEED] Initializing database with realistic Pakistani school data...');

  const defaultPasswordHash = await hashPassword('Pass1234');

  // 1. Institute
  const instituteId = 'inst-imcg-001';
  const institute: Institute = {
    id: instituteId,
    name: 'ADD YOUR INSTITUTE',
    code: 'IMCB-F84',
    domain: 'imcb.edu.pk',
    logo_url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    phone: '+92 51 9260123',
    email: 'info@imcb.edu.pk',
    address: 'Sector F-8/4, Islamabad, Federal Capital',
    city: 'Islamabad',
    province: 'Federal',
    country: 'Pakistan',
    grading_scheme_type: 'PERCENTAGE',
    currency: 'PKR',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.institutes.insertOne(institute);

  // 2. Users (Super Admin, Principal, Admin, Teachers, Students, Parents, Accountant)
  const users: User[] = [
    {
      id: 'usr-superadmin',
      institute_id: instituteId,
      email: 'admin@imcb.edu.pk',
      phone: '+923001112233',
      password_hash: defaultPasswordHash,
      full_name: 'Super Administrator',
      role: 'super_admin',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-principal',
      institute_id: instituteId,
      email: 'principal@imcb.edu.pk',
      phone: '+923002223344',
      password_hash: defaultPasswordHash,
      full_name: 'Dr. Tariq Mahmood',
      role: 'principal',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-teacher-1',
      institute_id: instituteId,
      email: 'teacher@imcb.edu.pk',
      phone: '+923003334455',
      password_hash: defaultPasswordHash,
      full_name: 'Prof. Muhammad Usman',
      role: 'teacher',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-student-1',
      institute_id: instituteId,
      email: 'student@imcb.edu.pk',
      phone: '+923004445566',
      password_hash: defaultPasswordHash,
      full_name: 'Ayan Ahmed',
      role: 'student',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-parent-1',
      institute_id: instituteId,
      email: 'parent@imcb.edu.pk',
      phone: '+923005556677',
      password_hash: defaultPasswordHash,
      full_name: 'Rashid Ahmed',
      role: 'parent',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'usr-accountant-1',
      institute_id: instituteId,
      email: 'accounts@imcb.edu.pk',
      phone: '+923006667788',
      password_hash: defaultPasswordHash,
      full_name: 'Kashif Ali',
      role: 'accountant',
      is_active: true,
      is_email_verified: true,
      is_phone_verified: true,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await repo.users.insertMany(users);

  // 3. Academic Years & Terms
  const ay: AcademicYear = {
    id: 'ay-2025-2026',
    institute_id: instituteId,
    name: '2025-2026',
    start_date: '2025-08-01',
    end_date: '2026-06-30',
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.academicYears.insertOne(ay);

  const term1: Term = {
    id: 't-1-2025',
    institute_id: instituteId,
    academic_year_id: ay.id,
    name: 'First Term (Midterm)',
    start_date: '2025-08-01',
    end_date: '2025-12-31',
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.terms.insertOne(term1);

  // 4. Classes & Sections
  const class10: ClassEntity = {
    id: 'cls-10',
    institute_id: instituteId,
    name: 'Class 10 (Matric)',
    code: 'CLS-10',
    level_order: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.classes.insertOne(class10);

  const secA: SectionEntity = {
    id: 'sec-10a',
    institute_id: instituteId,
    class_id: class10.id,
    name: 'A',
    capacity: 45,
    class_teacher_id: 'usr-teacher-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.sections.insertOne(secA);

  // 5. Subjects
  const subjects: SubjectEntity[] = [
    {
      id: 'sbj-phy',
      institute_id: instituteId,
      name: 'Physics',
      code: 'PHY-10',
      type: 'BOTH',
      credit_hours: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sbj-math',
      institute_id: instituteId,
      name: 'Mathematics',
      code: 'MTH-10',
      type: 'THEORY',
      credit_hours: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 'sbj-chem',
      institute_id: instituteId,
      name: 'Chemistry',
      code: 'CHM-10',
      type: 'BOTH',
      credit_hours: 4,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ];
  await repo.subjects.insertMany(subjects);

  // 6. Teacher
  const teacherObj: TeacherEntity = {
    id: 'tch-01',
    institute_id: instituteId,
    user_id: 'usr-teacher-1',
    emp_id: 'TCH-1088',
    full_name: 'Prof. Muhammad Usman',
    designation: 'Senior Assistant Professor',
    qualification: 'M.Phil Physics (Quaid-i-Azam University)',
    specialization: 'Quantum Mechanics & Electronics',
    joining_date: '2018-09-01',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.teachers.insertOne(teacherObj);

  // 7. Student
  const studentObj: StudentEntity = {
    id: 'std-01',
    institute_id: instituteId,
    user_id: 'usr-student-1',
    registration_no: 'IMCB-2025-0104',
    roll_no: '1001',
    full_name: 'Ayan Ahmed',
    gender: 'MALE',
    dob: '2009-04-12',
    cnic_bform: '61101-1234567-1',
    class_id: class10.id,
    section_id: secA.id,
    academic_year_id: ay.id,
    guardian_name: 'Rashid Ahmed',
    guardian_phone: '+923005556677',
    guardian_relation: 'Father',
    address: 'House 42, Street 15, F-8/2, Islamabad',
    status: 'ACTIVE',
    admission_date: '2024-04-01',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.students.insertOne(studentObj);

  // 8. Parent & Link
  const parentObj: ParentEntity = {
    id: 'prn-01',
    institute_id: instituteId,
    user_id: 'usr-parent-1',
    full_name: 'Rashid Ahmed',
    cnic: '61101-9876543-1',
    occupation: 'Senior Executive Officer (CDA)',
    address: 'House 42, Street 15, F-8/2, Islamabad',
    secondary_phone: '+923125559988',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.parents.insertOne(parentObj);

  const link: ParentStudentLink = {
    id: 'psl-01',
    institute_id: instituteId,
    parent_id: parentObj.id,
    student_id: studentObj.id,
    relationship: 'FATHER',
    is_primary_contact: true,
    created_at: new Date().toISOString()
  };
  await repo.parentStudentLinks.insertOne(link);

  // 9. Course
  const courseObj: CourseEntity = {
    id: 'crs-phy-10',
    institute_id: instituteId,
    subject_id: subjects[0].id,
    class_id: class10.id,
    teacher_id: 'usr-teacher-1',
    title: 'Class 10 Physics: Mechanics & Electromagnetism',
    code: 'PHY-10A',
    description: 'Federal Board Matriculation Physics syllabus including Electrostatics, Current Electricity, Wave Optics, and Atomic Physics.',
    thumbnail_url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=500&auto=format&fit=crop&q=80',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.courses.insertOne(courseObj);

  // 10. Assignment
  const asg: AssignmentEntity = {
    id: 'asg-phy-01',
    institute_id: instituteId,
    course_id: courseObj.id,
    class_id: class10.id,
    section_id: secA.id,
    subject_id: subjects[0].id,
    teacher_id: 'usr-teacher-1',
    title: 'Numerical Problems on Coulomb Law & Electric Potential',
    description: 'Solve textbook problems 1 to 10 from Chapter 13. Write step-by-step calculations with SI units.',
    due_date: '2026-08-20T17:00:00.000Z',
    total_marks: 50,
    allowed_file_types: ['pdf', 'docx'],
    max_file_size_mb: 10,
    allow_late_submission: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.assignments.insertOne(asg);

  // 11. Exam & Grades
  const exam: ExamEntity = {
    id: 'exm-mid-2025',
    institute_id: instituteId,
    term_id: term1.id,
    academic_year_id: ay.id,
    title: 'Midterm Examination 2025',
    start_date: '2025-10-15',
    end_date: '2025-10-28',
    status: 'PUBLISHED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.exams.insertOne(exam);

  const examSub: ExamSubjectEntity = {
    id: 'exm-sub-phy',
    institute_id: instituteId,
    exam_id: exam.id,
    class_id: class10.id,
    section_id: secA.id,
    subject_id: subjects[0].id,
    exam_date: '2025-10-18',
    start_time: '09:00',
    duration_minutes: 180,
    total_marks: 100,
    passing_marks: 33,
    room_name: 'Physics Lab 1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.examSubjects.insertOne(examSub);

  const gradeRecord: GradeRecordEntity = {
    id: 'grd-01',
    institute_id: instituteId,
    exam_subject_id: examSub.id,
    student_id: studentObj.id,
    marks_obtained: 88,
    total_marks: 100,
    grade_letter: 'A1',
    gpa_points: 4.0,
    remarks: 'Outstanding performance in theory and numericals.',
    entered_by_user_id: 'usr-teacher-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.gradeRecords.insertOne(gradeRecord);

  // 12. Fee Structures, Invoices & Payments (PKR)
  const feeStructure: FeeStructure = {
    id: 'fs-class10-monthly',
    institute_id: instituteId,
    class_id: class10.id,
    title: 'Class 10 Monthly Tuition & Lab Fee',
    amount_pkr: 18500,
    frequency: 'MONTHLY',
    due_day_of_month: 10,
    late_fee_fine_pkr: 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.feeStructures.insertOne(feeStructure);

  const invoice: InvoiceEntity = {
    id: 'inv-2026-08-001',
    institute_id: instituteId,
    invoice_no: 'INV-202608-01',
    student_id: studentObj.id,
    class_id: class10.id,
    fee_structure_id: feeStructure.id,
    title: 'August 2026 Monthly Tuition Fee',
    amount_pkr: 18500,
    discount_pkr: 1000,
    net_amount_pkr: 17500,
    paid_amount_pkr: 17500,
    issue_date: '2026-08-01',
    due_date: '2026-08-10',
    status: 'PAID',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.invoices.insertOne(invoice);

  const payment: PaymentRecord = {
    id: 'pay-001',
    institute_id: instituteId,
    invoice_id: invoice.id,
    receipt_no: 'RCT-202608-88',
    amount_pkr: 17500,
    payment_method: 'JAZZCASH',
    transaction_ref: 'JC-882910482',
    paid_date: '2026-08-04T10:30:00.000Z',
    recorded_by_user_id: 'usr-accountant-1',
    notes: 'Paid via JazzCash Mobile Wallet',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.payments.insertOne(payment);

  // 13. Timetable
  const slot: TimetableSlotEntity = {
    id: 'slot-1',
    institute_id: instituteId,
    class_id: class10.id,
    section_id: secA.id,
    day_of_week: 'MONDAY',
    start_time: '08:00',
    end_time: '08:45',
    subject_id: subjects[0].id,
    teacher_id: 'usr-teacher-1',
    room_name: 'Room 204',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.timetableSlots.insertOne(slot);

  // 14. Announcements & Notifications
  const announcement: AnnouncementEntity = {
    id: 'anc-01',
    institute_id: instituteId,
    title: 'Midterm Examination Schedule Announcement',
    content: 'All students and faculty are informed that Midterm Examinations for Session 2025-26 will commence from October 15, 2025.',
    target_roles: ['student', 'teacher', 'parent', 'administrator'],
    priority: 'HIGH',
    author_id: 'usr-principal',
    author_name: 'Dr. Tariq Mahmood (Principal)',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  await repo.announcements.insertOne(announcement);

  const notification: NotificationEntity = {
    id: 'notif-01',
    institute_id: instituteId,
    user_id: 'usr-student-1',
    title: 'Fee Receipt Issued',
    body: 'Payment of PKR 17,500 for Invoice INV-202608-01 has been confirmed.',
    type: 'FEE',
    is_read: false,
    created_at: new Date().toISOString()
  };
  await repo.notifications.insertOne(notification);

  console.log('[SEED] Database seeded successfully!');
}