-- ==============================================================================
-- TaleemLMS Multi-Tenant Relational Database Schema (PostgreSQL 14+)
-- Designed for Pakistani Educational Institutes and SaaS Scale
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. INSTITUTES (Tenants)
-- ------------------------------------------------------------------------------
CREATE TABLE institutes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL, -- e.g. IMCG-F62
    domain VARCHAR(100) UNIQUE,
    logo_url TEXT,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL DEFAULT 'Islamabad',
    province VARCHAR(100) NOT NULL DEFAULT 'Federal',
    country VARCHAR(100) NOT NULL DEFAULT 'Pakistan',
    grading_scheme_type VARCHAR(20) NOT NULL DEFAULT 'PERCENTAGE', -- PERCENTAGE, LETTER, GPA, MARKS
    currency VARCHAR(10) NOT NULL DEFAULT 'PKR',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_institutes_code ON institutes(code);

-- ------------------------------------------------------------------------------
-- 2. USERS & AUTHENTICATION
-- ------------------------------------------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role VARCHAR(30) NOT NULL, -- super_admin, principal, administrator, teacher, student, parent, accountant, staff
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    is_email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    is_phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
    two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    failed_login_attempts INT NOT NULL DEFAULT 0,
    lockout_until TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    avatar_url TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    deleted_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_users_institute_email UNIQUE (institute_id, email),
    CONSTRAINT uq_users_institute_phone UNIQUE (institute_id, phone)
);

CREATE INDEX idx_users_institute_role ON users(institute_id, role);

-- ------------------------------------------------------------------------------
-- 3. ROLES & PERMISSIONS
-- ------------------------------------------------------------------------------
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL, -- e.g., 'attendance.create'
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role VARCHAR(30) NOT NULL,
    permission_code VARCHAR(100) NOT NULL REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role, permission_code)
);

-- ------------------------------------------------------------------------------
-- 4. ACADEMIC YEARS & TERMS
-- ------------------------------------------------------------------------------
CREATE TABLE academic_years (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "2025-2026"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_academic_years_tenant ON academic_years(institute_id, is_current);

CREATE TABLE terms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "First Term"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 5. CLASSES, SECTIONS & ROOMS
-- ------------------------------------------------------------------------------
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "Science Lab 1" or "Room 102"
    capacity INT NOT NULL DEFAULT 40,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Class 10" or "F.Sc Part 1"
    code VARCHAR(20) NOT NULL,
    level_order INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL, -- e.g. "A"
    capacity INT NOT NULL DEFAULT 40,
    class_teacher_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_class_section UNIQUE (class_id, name)
);

-- ------------------------------------------------------------------------------
-- 6. SUBJECTS & COURSES
-- ------------------------------------------------------------------------------
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- e.g. "Physics", "Urdu", "Islamiat"
    code VARCHAR(30) NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'THEORY', -- THEORY, PRACTICAL, BOTH
    credit_hours INT NOT NULL DEFAULT 3,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 7. TEACHERS, STUDENTS & PARENTS
-- ------------------------------------------------------------------------------
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    emp_id VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    designation VARCHAR(100) NOT NULL DEFAULT 'Senior Teacher',
    qualification VARCHAR(100) NOT NULL DEFAULT 'M.Sc',
    specialization VARCHAR(100),
    joining_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_teacher_emp UNIQUE (institute_id, emp_id)
);

CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registration_no VARCHAR(50) NOT NULL,
    roll_no VARCHAR(50) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(10) NOT NULL, -- MALE, FEMALE, OTHER
    dob DATE NOT NULL,
    cnic_bform VARCHAR(30) NOT NULL,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE RESTRICT,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE RESTRICT,
    guardian_name VARCHAR(150) NOT NULL,
    guardian_phone VARCHAR(20) NOT NULL,
    guardian_relation VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE', -- ACTIVE, ARCHIVED, GRADUATED, TRANSFERRED
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_reg UNIQUE (institute_id, registration_no)
);

CREATE INDEX idx_students_class_section ON students(institute_id, class_id, section_id);

CREATE TABLE parents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    cnic VARCHAR(30) NOT NULL,
    occupation VARCHAR(100),
    address TEXT,
    secondary_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE parent_student_links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    relationship VARCHAR(20) NOT NULL DEFAULT 'FATHER', -- FATHER, MOTHER, GUARDIAN
    is_primary_contact BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_parent_student UNIQUE (parent_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 8. ATTENDANCE
-- ------------------------------------------------------------------------------
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(20) NOT NULL, -- PRESENT, ABSENT, LATE, EXCUSED
    remarks VARCHAR(255),
    marked_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_daily_attendance UNIQUE (institute_id, student_id, date)
);

CREATE INDEX idx_attendance_lookup ON attendance(institute_id, class_id, section_id, date);

-- ------------------------------------------------------------------------------
-- 9. ASSIGNMENTS & SUBMISSIONS (LMS)
-- ------------------------------------------------------------------------------
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    allowed_file_types TEXT, -- e.g. "pdf,docx,jpg"
    max_file_size_mb INT NOT NULL DEFAULT 10,
    allow_late_submission BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    submission_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'SUBMITTED', -- SUBMITTED, GRADED, LATE
    grade_obtained NUMERIC(5,2),
    feedback TEXT,
    graded_by_user_id UUID REFERENCES users(id),
    graded_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_assignment UNIQUE (assignment_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 10. EXAMS & GRADETABLE
-- ------------------------------------------------------------------------------
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    term_id UUID NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
    academic_year_id UUID NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- e.g. "Midterm Examinations 2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_PROGRESS, COMPLETED, PUBLISHED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    exam_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 120,
    total_marks INT NOT NULL DEFAULT 100,
    passing_marks INT NOT NULL DEFAULT 33,
    room_name VARCHAR(100) NOT NULL DEFAULT 'Main Hall',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE grade_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    exam_subject_id UUID NOT NULL REFERENCES exam_subjects(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    marks_obtained NUMERIC(5,2) NOT NULL,
    total_marks INT NOT NULL DEFAULT 100,
    grade_letter VARCHAR(5),
    gpa_points NUMERIC(3,2),
    remarks VARCHAR(255),
    entered_by_user_id UUID NOT NULL REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_student_exam_subject UNIQUE (exam_subject_id, student_id)
);

-- ------------------------------------------------------------------------------
-- 11. TIMETABLE
-- ------------------------------------------------------------------------------
CREATE TABLE timetable_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
    day_of_week VARCHAR(15) NOT NULL, -- MONDAY, TUESDAY, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    room_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 12. FEES, INVOICES & PAYMENTS (PKR)
-- ------------------------------------------------------------------------------
CREATE TABLE fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL, -- e.g. "Class 10 Monthly Tuition Fee"
    amount_pkr NUMERIC(10,2) NOT NULL,
    frequency VARCHAR(20) NOT NULL DEFAULT 'MONTHLY', -- MONTHLY, TERM, ANNUAL, ONE_TIME
    due_day_of_month INT NOT NULL DEFAULT 10,
    late_fee_fine_pkr NUMERIC(10,2) NOT NULL DEFAULT 500,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    invoice_no VARCHAR(50) NOT NULL,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
    title VARCHAR(200) NOT NULL,
    amount_pkr NUMERIC(10,2) NOT NULL,
    discount_pkr NUMERIC(10,2) NOT NULL DEFAULT 0,
    net_amount_pkr NUMERIC(10,2) NOT NULL,
    paid_amount_pkr NUMERIC(10,2) NOT NULL DEFAULT 0,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UNPAID', -- UNPAID, PARTIALLY_PAID, PAID, OVERDUE, CANCELLED
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_invoice_no UNIQUE (institute_id, invoice_no)
);

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    receipt_no VARCHAR(50) NOT NULL,
    amount_pkr NUMERIC(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL, -- CASH, BANK_TRANSFER, ONLINE_CARD, JAZZCASH, EASYPAISA
    transaction_ref VARCHAR(100),
    paid_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    recorded_by_user_id UUID NOT NULL REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_receipt_no UNIQUE (institute_id, receipt_no)
);

-- ------------------------------------------------------------------------------
-- 13. COMMUNICATION & MESSAGING
-- ------------------------------------------------------------------------------
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    content TEXT NOT NULL,
    target_roles TEXT[] NOT NULL, -- Array of roles
    priority VARCHAR(20) NOT NULL DEFAULT 'NORMAL',
    author_id UUID NOT NULL REFERENCES users(id),
    author_name VARCHAR(150) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    conversation_id VARCHAR(100) NOT NULL,
    sender_id UUID NOT NULL REFERENCES users(id),
    recipient_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    attachment_url TEXT,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    body TEXT NOT NULL,
    type VARCHAR(30) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    link_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------------------------
-- 14. AUDIT LOGS & FILES METADATA
-- ------------------------------------------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role VARCHAR(50) NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_resource VARCHAR(100) NOT NULL,
    target_id VARCHAR(100),
    ip_address VARCHAR(45),
    metadata_json TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
    uploaded_by_user_id UUID NOT NULL REFERENCES users(id),
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    module VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_institute ON audit_logs(institute_id, created_at DESC);
