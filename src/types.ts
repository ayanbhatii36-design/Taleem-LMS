export type UserRole = 'principal' | 'teacher' | 'student' | 'parent';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  instituteName: string;
  rollNumber?: string;
  className?: string;
  section?: string;
  childIds?: string[]; // For Parent role
}

export interface Student {
  id: string;
  rollNo: string;
  name: string;
  guardianName: string;
  phone: string;
  email: string;
  className: string;
  section: string;
  status: 'Active' | 'Inactive' | 'Graduated' | 'Suspended';
  admissionYear: string;
  gpa: number;
  attendancePct: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  feeAmountPKR: number;
  address: string;
  cnicBForm: string;
  avatar: string;
  subjects: string[];
}

export interface Teacher {
  id: string;
  empId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  qualification: string;
  department: string;
  subjects: string[];
  assignedClasses: string[];
  attendancePct: number;
  performanceRating: number; // e.g. 4.8 out of 5
  avatar: string;
  status: 'Active' | 'On Leave' | 'Inactive';
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  classTeacher: string;
  studentCount: number;
  subjectsCount: number;
  attendancePct: number;
  gpaAverage: number;
  department: string;
  subjects: string[];
}

export interface Course {
  id: string;
  code: string;
  title: string;
  instructor: string;
  className: string;
  section: string;
  progress: number; // 0-100
  description: string;
  modulesCount: number;
  enrolledStudents: number;
  coverImage: string;
  modules: CourseModule[];
}

export interface CourseModule {
  id: string;
  title: string;
  duration: string;
  lessons: {
    id: string;
    title: string;
    type: 'video' | 'document' | 'quiz' | 'assignment';
    duration?: string;
    completed?: boolean;
    fileUrl?: string;
  }[];
}

export interface Assignment {
  id: string;
  title: string;
  subject: string;
  className: string;
  section: string;
  teacherName: string;
  dueDate: string;
  totalMarks: number;
  submissionStatus: 'Pending' | 'Submitted' | 'Graded' | 'Overdue';
  grade?: string;
  marksObtained?: number;
  instructions: string;
  fileCount: number;
  submissionsCount?: number;
  totalStudentsCount?: number;
}

export interface Exam {
  id: string;
  title: string;
  subject: string;
  className: string;
  section: string;
  date: string;
  time: string;
  duration: string;
  totalMarks: number;
  passingMarks: number;
  roomNo: string;
  term: 'First Term' | 'Midterm' | 'Final Term' | 'Board Test';
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Graded';
}

export interface GradeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  subject: string;
  examTitle: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  gradeLetter: string;
  remarks: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  section: string;
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  remarks?: string;
}

export interface TimetableSlot {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  startTime: string;
  endTime: string;
  subject: string;
  teacherName: string;
  room: string;
  className: string;
  section: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  className: string;
  month: string;
  amountPKR: number;
  discountPKR: number;
  netAmountPKR: number;
  dueDate: string;
  status: 'Paid' | 'Pending' | 'Overdue';
  paymentMethod?: 'EasyPaisa' | 'JazzCash' | 'Bank Transfer' | 'Cash Deposit' | 'HBL Direct';
  paidDate?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  targetRole: 'All' | 'Students' | 'Parents' | 'Teachers';
  author: string;
  date: string;
  priority: 'Normal' | 'Urgent' | 'High';
  category: 'Academic' | 'Administrative' | 'Events' | 'Fee Alert';
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  recipientRole: UserRole;
  subject: string;
  text: string;
  timestamp: string;
  unread: boolean;
  childContext?: string; // e.g. "Regarding Ali's Physics Test"
}

export interface ChildInfo {
  id: string;
  name: string;
  rollNo: string;
  className: string;
  section: string;
  gpa: number;
  attendancePct: number;
  feeStatus: 'Paid' | 'Pending' | 'Overdue';
  pendingAmountPKR: number;
  avatar: string;
  recentGrades: { subject: string; score: string; date: string; grade: string }[];
  alerts: { id: string; type: 'warning' | 'info' | 'danger'; text: string; date: string }[];
  teacherContacts: { teacherName: string; subject: string; email: string; phone: string }[];
}

export interface InstituteInfo {
  name: string;
  type: 'School' | 'College' | 'Academy' | 'Tuition Center';
  tagline: string;
  logo: string;
  primaryColor: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  academicYear: string;
  gradingSystem: 'Percentage (Board)' | 'GPA 4.0' | 'Cambridge (A*-U)';
}
