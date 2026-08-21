import {
  Student,
  Teacher,
  Assignment,
  Exam,
  FeeInvoice,
  AttendanceRecord,
  TimetableSlot,
  Announcement,
  Message
} from '../types';

// Map backend snake_case entities to the camelCase frontend display types.

export function mapStudent(s: any): Student {
  return {
    id: s.id,
    rollNo: s.roll_no || '',
    name: s.full_name || 'Unknown',
    guardianName: s.guardian_name || '—',
    phone: s.guardian_phone || '',
    email: s.email || '',
    className: s.class_name || '',
    section: s.section_name || '',
    status: (s.status === 'ACTIVE' ? 'Active' : s.status === 'ARCHIVED' ? 'Inactive' : 'Graduated') as Student['status'],
    admissionYear: (s.admission_date || '').slice(0, 4),
    gpa: s.gpa ?? 3.0,
    attendancePct: s.attendance_pct ?? 90,
    feeStatus: (s.fee_status || 'Pending') as Student['feeStatus'],
    feeAmountPKR: s.fee_amount_pkr ?? 0,
    address: s.address || '',
    cnicBForm: s.cnic_bform || '',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    subjects: s.subjects || []
  };
}

export function mapTeacher(t: any): Teacher {
  return {
    id: t.id,
    empId: t.emp_id || '',
    name: t.full_name || 'Unknown',
    email: t.email || '',
    phone: t.phone || '',
    designation: t.designation || 'Lecturer',
    qualification: t.qualification || 'M.Sc',
    department: t.department_name || 'Science',
    subjects: t.subjects || [],
    assignedClasses: t.assigned_classes || [],
    attendancePct: t.attendance_pct ?? 96,
    performanceRating: t.performance_rating ?? 4.8,
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
    status: (t.status === 'ON_LEAVE' ? 'On Leave' : 'Active') as Teacher['status']
  };
}

export function mapAssignment(a: any): Assignment {
  return {
    id: a.id,
    title: a.title || 'Assignment',
    subject: a.subject_name || '',
    className: a.class_name || '',
    section: a.section_name || '',
    teacherName: a.teacher_name || '',
    dueDate: (a.due_date || '').slice(0, 10),
    totalMarks: a.total_marks ?? 50,
    submissionStatus: 'Pending',
    instructions: a.description || '',
    fileCount: 1,
    submissionsCount: a.submissions_count ?? 0,
    totalStudentsCount: a.total_students ?? 0
  };
}

export function mapExam(e: any): Exam {
  return {
    id: e.id,
    title: e.title || 'Exam',
    subject: e.subject_name || '',
    className: e.class_name || '',
    section: e.section_name || '',
    date: e.start_date || '',
    time: '09:00 AM',
    duration: '2 Hours',
    totalMarks: e.total_marks ?? 100,
    passingMarks: e.passing_marks ?? 33,
    roomNo: e.room_name || 'Hall 1',
    term: 'Midterm',
    status: (e.status === 'COMPLETED' || e.status === 'PUBLISHED' ? 'Completed' : 'Upcoming') as Exam['status']
  };
}

export function mapInvoice(i: any): FeeInvoice {
  return {
    id: i.id,
    invoiceNo: i.invoice_no || i.id,
    studentId: i.student_id || '',
    studentName: i.studentName || 'Student',
    rollNo: i.rollNo || '',
    className: i.class_name || '',
    month: (i.title || '').replace(/.*?(\d{4})/g, '$1'),
    amountPKR: i.amount_pkr ?? 0,
    discountPKR: i.discount_pkr ?? 0,
    netAmountPKR: i.net_amount_pkr ?? i.amount_pkr ?? 0,
    dueDate: i.due_date || '',
    status: (i.status === 'PAID' ? 'Paid' : i.status === 'OVERDUE' ? 'Overdue' : 'Pending') as FeeInvoice['status'],
    paymentMethod: i.payments?.[0]?.payment_method
      ? { CASH: 'Cash Deposit', JAZZCASH: 'JazzCash', EASYPAISA: 'EasyPaisa', BANK_TRANSFER: 'Bank Transfer' }[i.payments[0].payment_method] as FeeInvoice['paymentMethod']
      : undefined,
    paidDate: i.payments?.[0]?.paid_date?.slice(0, 10)
  };
}

export function mapAttendanceRecord(r: any): AttendanceRecord {
  return {
    id: r.id,
    studentId: r.student_id,
    studentName: r.student_name || 'Student',
    rollNo: r.roll_no || '',
    className: r.class_name || '',
    section: r.section_name || '',
    date: r.date,
    status: (r.status === 'ABSENT' ? 'Absent' : r.status === 'LATE' ? 'Late' : r.status === 'EXCUSED' ? 'Excused' : 'Present') as AttendanceRecord['status'],
    remarks: r.remarks || ''
  };
}

export function mapTimetableSlot(s: any): TimetableSlot {
  const dayMap: Record<string, TimetableSlot['day']> = {
    MONDAY: 'Monday', TUESDAY: 'Tuesday', WEDNESDAY: 'Wednesday',
    THURSDAY: 'Thursday', FRIDAY: 'Friday', SATURDAY: 'Saturday'
  };
  return {
    id: s.id,
    day: dayMap[s.day_of_week] || 'Monday',
    startTime: s.start_time || '08:00',
    endTime: s.end_time || '08:45',
    subject: s.subject_name || '',
    teacherName: s.teacher_name || '',
    room: s.room_name || '',
    className: s.class_name || '',
    section: s.section_name || ''
  };
}

export function mapAnnouncement(a: any): Announcement {
  return {
    id: a.id,
    title: a.title || 'Notice',
    content: a.content || '',
    targetRole: 'All',
    author: a.author_name || '',
    date: (a.created_at || '').slice(0, 10),
    priority: (a.priority === 'URGENT' ? 'Urgent' : a.priority === 'HIGH' ? 'High' : 'Normal') as Announcement['priority'],
    category: 'Academic'
  };
}

export function mapMessage(m: any): Message {
  return {
    id: m.id,
    senderId: m.sender_id || '',
    senderName: m.sender_name || 'User',
    senderRole: 'teacher',
    recipientId: m.recipient_id || '',
    recipientName: m.recipient_name || 'User',
    recipientRole: 'teacher',
    subject: m.subject || '',
    text: m.content || m.text || '',
    timestamp: m.created_at || '',
    unread: !m.is_read
  };
}

export const mapList = <T,>(items: any[], mapper: (item: any) => T): T[] =>
  Array.isArray(items) ? items.map(mapper) : [];