import {
  InstituteInfo,
  User,
  Student,
  Teacher,
  ClassItem,
  Course,
  Assignment,
  Exam,
  GradeRecord,
  TimetableSlot,
  FeeInvoice,
  Announcement,
  Message,
  ChildInfo
} from '../types';

export const initialInstitute: InstituteInfo = {
  name: 'ADD YOUR INSTITUTE',
  type: 'College',
  tagline: 'Excellence in Academic Mastery & Character Building',
  logo: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=150&auto=format&fit=crop&q=80',
  primaryColor: '#0f766e', // Emerald / Teal tone
  address: 'Sector F-7/2, College Road',
  city: 'Islamabad, Pakistan',
  phone: '+92 51 9201456',
  email: 'info@imca.edu.pk',
  academicYear: '2025 - 2026',
  gradingSystem: 'Percentage (Board)'
};

export const sampleUsers: Record<string, User> = {
  principal: {
    id: 'usr-admin-1',
    name: 'Prof. Dr. Tariq Mahmood',
    email: 'principal@imca.edu.pk',
    phone: '+92 300 8554321',
    role: 'principal',
    instituteName: 'ADD YOUR INSTITUTE',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  },
  teacher: {
    id: 'usr-tch-1',
    name: 'Sir Farooq Ahmed',
    email: 'farooq.physics@imca.edu.pk',
    phone: '+92 321 5544332',
    role: 'teacher',
    instituteName: 'ADD YOUR INSTITUTE',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  student: {
    id: 'usr-std-1',
    name: 'Muhammad Aayan Khan',
    email: 'aayan.khan@student.imca.edu.pk',
    phone: '+92 333 4455667',
    role: 'student',
    rollNumber: 'IMC-2025-104',
    className: 'Class 10',
    section: 'A (Pre-Engineering)',
    instituteName: 'ADD YOUR INSTITUTE',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80'
  },
  parent: {
    id: 'usr-prn-1',
    name: 'Chaudhry Rashid Khan',
    email: 'rashid.khan@gmail.com',
    phone: '+92 301 9876543',
    role: 'parent',
    instituteName: 'ADD YOUR INSTITUTE',
    childIds: ['std-1', 'std-2'],
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  }
};

export const sampleStudents: Student[] = [
  {
    id: 'std-1',
    rollNo: 'IMC-104',
    name: 'Muhammad Aayan Khan',
    guardianName: 'Chaudhry Rashid Khan',
    phone: '+92 301 9876543',
    email: 'aayan.khan@student.imca.edu.pk',
    className: 'Class 10',
    section: 'A',
    status: 'Active',
    admissionYear: '2023',
    gpa: 3.85,
    attendancePct: 94,
    feeStatus: 'Paid',
    feeAmountPKR: 18500,
    address: 'House 42, Street 12, F-7/1, Islamabad',
    cnicBForm: '61101-1234567-3',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    subjects: ['Physics', 'Mathematics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies']
  },
  {
    id: 'std-2',
    rollNo: 'IMC-108',
    name: 'Zoya Rashid Khan',
    guardianName: 'Chaudhry Rashid Khan',
    phone: '+92 301 9876543',
    email: 'zoya.khan@student.imca.edu.pk',
    className: 'Class 8',
    section: 'B',
    status: 'Active',
    admissionYear: '2024',
    gpa: 3.65,
    attendancePct: 78, // Low attendance triggers alert!
    feeStatus: 'Pending',
    feeAmountPKR: 16000,
    address: 'House 42, Street 12, F-7/1, Islamabad',
    cnicBForm: '61101-7654321-4',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    subjects: ['General Science', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Computer Science']
  },
  {
    id: 'std-3',
    rollNo: 'IMC-112',
    name: 'Fatima Zahra',
    guardianName: 'Dr. Shahbaz Chaudhry',
    phone: '+92 322 8877665',
    email: 'fatima.zahra@student.imca.edu.pk',
    className: 'F.Sc Part 1',
    section: 'Pre-Medical A',
    status: 'Active',
    admissionYear: '2025',
    gpa: 3.92,
    attendancePct: 98,
    feeStatus: 'Paid',
    feeAmountPKR: 24000,
    address: 'G-9/3, Islamabad',
    cnicBForm: '35202-9988771-2',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu']
  },
  {
    id: 'std-4',
    rollNo: 'IMC-115',
    name: 'Hamza Bilal',
    guardianName: 'Bilal Ahmed Butt',
    phone: '+92 345 1122334',
    email: 'hamza.bilal@student.imca.edu.pk',
    className: 'Class 9',
    section: 'Science B',
    status: 'Active',
    admissionYear: '2024',
    gpa: 3.12,
    attendancePct: 82,
    feeStatus: 'Overdue',
    feeAmountPKR: 17500,
    address: 'I-8/2, Islamabad',
    cnicBForm: '61101-4433221-1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    subjects: ['Mathematics', 'Physics', 'Computer Science', 'English', 'Urdu']
  },
  {
    id: 'std-5',
    rollNo: 'IMC-120',
    name: 'Syeda Mahnoor Shah',
    guardianName: 'Syed Imran Shah',
    phone: '+92 331 6655443',
    email: 'mahnoor.shah@student.imca.edu.pk',
    className: 'Class 10',
    section: 'A',
    status: 'Active',
    admissionYear: '2023',
    gpa: 3.95,
    attendancePct: 96,
    feeStatus: 'Paid',
    feeAmountPKR: 18500,
    address: 'PWD Society, Islamabad',
    cnicBForm: '37405-1122334-6',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&auto=format&fit=crop&q=80',
    subjects: ['Physics', 'Mathematics', 'Chemistry', 'English', 'Urdu']
  }
];

export const sampleTeachers: Teacher[] = [
  {
    id: 'tch-1',
    empId: 'TCH-201',
    name: 'Sir Farooq Ahmed',
    email: 'farooq.physics@imca.edu.pk',
    phone: '+92 321 5544332',
    designation: 'Head of Physics Department',
    qualification: 'M.Sc Applied Physics (Quaid-i-Azam University)',
    department: 'Science',
    subjects: ['Physics', 'Applied Physics'],
    assignedClasses: ['Class 10-A', 'F.Sc Part 1 Pre-Engg', 'F.Sc Part 2'],
    attendancePct: 97,
    performanceRating: 4.9,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'tch-2',
    empId: 'TCH-202',
    name: 'Ma\'am Sadia Naz',
    email: 'sadia.math@imca.edu.pk',
    phone: '+92 300 4433221',
    designation: 'Senior Mathematics Lecturer',
    qualification: 'M.Phil Mathematics (NUST)',
    department: 'Mathematics',
    subjects: ['Mathematics', 'Additional Math'],
    assignedClasses: ['Class 9-Science', 'Class 10-A', 'F.Sc Part 1'],
    attendancePct: 95,
    performanceRating: 4.8,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'tch-3',
    empId: 'TCH-203',
    name: 'Prof. Imran Qureshi',
    email: 'imran.chem@imca.edu.pk',
    phone: '+92 333 8899001',
    designation: 'Associate Professor Chemistry',
    qualification: 'Ph.D Organic Chemistry (PU Lahore)',
    department: 'Science',
    subjects: ['Chemistry'],
    assignedClasses: ['Class 10-A', 'F.Sc Part 1 Pre-Med'],
    attendancePct: 92,
    performanceRating: 4.7,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
  },
  {
    id: 'tch-4',
    empId: 'TCH-204',
    name: 'Ma\'am Anum Chaudhry',
    email: 'anum.eng@imca.edu.pk',
    phone: '+92 312 7766554',
    designation: 'Lecturer English Literature',
    qualification: 'M.A English (NUML)',
    department: 'Humanities',
    subjects: ['English Compulsory', 'English Literature'],
    assignedClasses: ['Class 8-B', 'Class 9-Science', 'Class 10-A'],
    attendancePct: 99,
    performanceRating: 4.9,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80'
  }
];

export const sampleClasses: ClassItem[] = [
  {
    id: 'cls-10a',
    name: 'Class 10',
    section: 'A (Pre-Engineering)',
    classTeacher: 'Sir Farooq Ahmed',
    studentCount: 38,
    subjectsCount: 6,
    attendancePct: 93,
    gpaAverage: 3.68,
    department: 'Secondary Science',
    subjects: ['Physics', 'Mathematics', 'Chemistry', 'English', 'Urdu', 'Pakistan Studies']
  },
  {
    id: 'cls-9sci',
    name: 'Class 9',
    section: 'Science B',
    classTeacher: 'Ma\'am Sadia Naz',
    studentCount: 42,
    subjectsCount: 6,
    attendancePct: 89,
    gpaAverage: 3.42,
    department: 'Secondary Science',
    subjects: ['Mathematics', 'Physics', 'Computer Science', 'English', 'Urdu', 'Islamiat']
  },
  {
    id: 'cls-fsc1m',
    name: 'F.Sc Part 1',
    section: 'Pre-Medical A',
    classTeacher: 'Prof. Imran Qureshi',
    studentCount: 35,
    subjectsCount: 5,
    attendancePct: 96,
    gpaAverage: 3.82,
    department: 'Higher Secondary',
    subjects: ['Biology', 'Physics', 'Chemistry', 'English', 'Urdu']
  },
  {
    id: 'cls-8b',
    name: 'Class 8',
    section: 'B',
    classTeacher: 'Ma\'am Anum Chaudhry',
    studentCount: 32,
    subjectsCount: 6,
    attendancePct: 87,
    gpaAverage: 3.35,
    department: 'Middle School',
    subjects: ['General Science', 'Mathematics', 'English', 'Urdu', 'Islamiat', 'Computer Science']
  }
];

export const sampleCourses: Course[] = [
  {
    id: 'crs-phy10',
    code: 'PHY-101',
    title: 'Class 10 Physics - FBISE Board Syllabus',
    instructor: 'Sir Farooq Ahmed',
    className: 'Class 10',
    section: 'A',
    progress: 68,
    description: 'Comprehensive coverage of Electromagnetism, Optics, Atomic Physics, and Practical Physics labs according to FBISE standards.',
    modulesCount: 8,
    enrolledStudents: 38,
    coverImage: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=400&auto=format&fit=crop&q=80',
    modules: [
      {
        id: 'mod-1',
        title: 'Module 1: Simple Harmonic Motion & Waves',
        duration: '2 Weeks',
        lessons: [
          { id: 'les-1', title: 'Oscillations and Hooke\'s Law Video Lecture', type: 'video', duration: '25 min', completed: true },
          { id: 'les-2', title: 'Wave Equation & Numerical Examples PDF', type: 'document', duration: '15 min', completed: true },
          { id: 'les-3', title: 'Chapter 1 Self-Assessment Quiz', type: 'quiz', duration: '10 min', completed: true }
        ]
      },
      {
        id: 'mod-2',
        title: 'Module 2: Sound & Acoustics',
        duration: '2 Weeks',
        lessons: [
          { id: 'les-4', title: 'Intensity Levels and Decibels (dB)', type: 'video', duration: '30 min', completed: true },
          { id: 'les-5', title: 'Audible Frequency Range & Ultrasound Notes', type: 'document', duration: '20 min', completed: false }
        ]
      },
      {
        id: 'mod-3',
        title: 'Module 3: Geometrical Optics',
        duration: '3 Weeks',
        lessons: [
          { id: 'les-6', title: 'Reflection & Lenses Ray Diagrams', type: 'video', duration: '40 min', completed: false },
          { id: 'les-7', title: 'Optical Instruments (Microscope & Telescope)', type: 'document', duration: '25 min', completed: false }
        ]
      }
    ]
  },
  {
    id: 'crs-math10',
    code: 'MTH-102',
    title: 'Class 10 Mathematics - Algebraic & Geometric Mastery',
    instructor: 'Ma\'am Sadia Naz',
    className: 'Class 10',
    section: 'A',
    progress: 75,
    description: 'Quadratic equations, Variations, Matrices, Geometry theorems, and Trigonometric identities.',
    modulesCount: 10,
    enrolledStudents: 38,
    coverImage: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=400&auto=format&fit=crop&q=80',
    modules: [
      {
        id: 'mmod-1',
        title: 'Module 1: Quadratic Equations',
        duration: '2 Weeks',
        lessons: [
          { id: 'mles-1', title: 'Quadratic Formula Derivation', type: 'video', duration: '30 min', completed: true },
          { id: 'mles-2', title: 'Factorization & Completing Square Exercises', type: 'document', duration: '20 min', completed: true }
        ]
      }
    ]
  },
  {
    id: 'crs-chem10',
    code: 'CHM-103',
    title: 'Class 10 Chemistry - Chemical Equilibrium & Organic Chemistry',
    instructor: 'Prof. Imran Qureshi',
    className: 'Class 10',
    section: 'A',
    progress: 54,
    description: 'Dynamic equilibrium, Acids & Bases, Hydrocarbons, Biochemistry and Environmental Chemistry.',
    modulesCount: 7,
    enrolledStudents: 38,
    coverImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&auto=format&fit=crop&q=80',
    modules: []
  }
];

export const sampleAssignments: Assignment[] = [
  {
    id: 'asg-1',
    title: 'Physics Chapter 3 Numerical Problems Set',
    subject: 'Physics',
    className: 'Class 10',
    section: 'A',
    teacherName: 'Sir Farooq Ahmed',
    dueDate: '2026-08-15',
    totalMarks: 20,
    submissionStatus: 'Pending',
    instructions: 'Solve Problems 3.1 to 3.10 from FBISE textbook on neat sheet. Submit scanned PDF or hardcopy.',
    fileCount: 2,
    submissionsCount: 28,
    totalStudentsCount: 38
  },
  {
    id: 'asg-2',
    title: 'Maths Quadratic Formula Worksheets',
    subject: 'Mathematics',
    className: 'Class 10',
    section: 'A',
    teacherName: 'Ma\'am Sadia Naz',
    dueDate: '2026-08-12',
    totalMarks: 15,
    submissionStatus: 'Graded',
    grade: 'A+',
    marksObtained: 15,
    instructions: 'Complete Ex 1.2 questions 1-8.',
    fileCount: 1,
    submissionsCount: 38,
    totalStudentsCount: 38
  },
  {
    id: 'asg-3',
    title: 'English Essay: Role of Youth in Pakistan\'s Progress',
    subject: 'English',
    className: 'Class 10',
    section: 'A',
    teacherName: 'Ma\'am Anum Chaudhry',
    dueDate: '2026-08-18',
    totalMarks: 25,
    submissionStatus: 'Pending',
    instructions: 'Write a 350-word essay with clear introduction, arguments, and conclusion.',
    fileCount: 1,
    submissionsCount: 12,
    totalStudentsCount: 38
  }
];

export const sampleExams: Exam[] = [
  {
    id: 'exm-1',
    title: 'Midterm Board Mock Exam - Physics',
    subject: 'Physics',
    className: 'Class 10',
    section: 'A',
    date: '2026-08-25',
    time: '09:00 AM - 12:00 PM',
    duration: '3 Hours',
    totalMarks: 85,
    passingMarks: 33,
    roomNo: 'Exam Hall 2',
    term: 'Midterm',
    status: 'Upcoming'
  },
  {
    id: 'exm-2',
    title: 'Chemistry Monthly Unit Test',
    subject: 'Chemistry',
    className: 'Class 10',
    section: 'A',
    date: '2026-08-20',
    time: '10:00 AM - 11:30 AM',
    duration: '1.5 Hours',
    totalMarks: 50,
    passingMarks: 20,
    roomNo: 'Room 104',
    term: 'First Term',
    status: 'Upcoming'
  },
  {
    id: 'exm-3',
    title: 'First Term Mathematics Comprehensive',
    subject: 'Mathematics',
    className: 'Class 10',
    section: 'A',
    date: '2026-07-10',
    time: '09:00 AM - 12:00 PM',
    duration: '3 Hours',
    totalMarks: 100,
    passingMarks: 40,
    roomNo: 'Exam Hall 1',
    term: 'First Term',
    status: 'Graded'
  }
];

export const sampleGradeRecords: GradeRecord[] = [
  {
    id: 'grd-1',
    studentId: 'std-1',
    studentName: 'Muhammad Aayan Khan',
    rollNo: 'IMC-104',
    className: 'Class 10',
    subject: 'Mathematics',
    examTitle: 'First Term Mathematics Comprehensive',
    marksObtained: 94,
    totalMarks: 100,
    percentage: 94,
    gradeLetter: 'A1',
    remarks: 'Outstanding conceptual problem solving ability!',
    date: '2026-07-15'
  },
  {
    id: 'grd-2',
    studentId: 'std-1',
    studentName: 'Muhammad Aayan Khan',
    rollNo: 'IMC-104',
    className: 'Class 10',
    subject: 'Physics',
    examTitle: 'Physics Unit 1-2 Test',
    marksObtained: 46,
    totalMarks: 50,
    percentage: 92,
    gradeLetter: 'A1',
    remarks: 'Excellent practical knowledge and formula applications.',
    date: '2026-07-22'
  },
  {
    id: 'grd-3',
    studentId: 'std-2',
    studentName: 'Zoya Rashid Khan',
    rollNo: 'IMC-108',
    className: 'Class 8',
    subject: 'General Science',
    examTitle: 'First Term Science Test',
    marksObtained: 38,
    totalMarks: 50,
    percentage: 76,
    gradeLetter: 'B',
    remarks: 'Good progress. Needs to focus more on diagram labeling.',
    date: '2026-07-20'
  }
];

export const sampleTimetable: TimetableSlot[] = [
  { id: 'tt-1', day: 'Monday', startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Physics', teacherName: 'Sir Farooq Ahmed', room: 'Lab 1', className: 'Class 10', section: 'A' },
  { id: 'tt-2', day: 'Monday', startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Mathematics', teacherName: 'Ma\'am Sadia Naz', room: 'Room 104', className: 'Class 10', section: 'A' },
  { id: 'tt-3', day: 'Monday', startTime: '10:00 AM', endTime: '10:45 AM', subject: 'Chemistry', teacherName: 'Prof. Imran Qureshi', room: 'Chem Lab', className: 'Class 10', section: 'A' },
  { id: 'tt-4', day: 'Tuesday', startTime: '08:30 AM', endTime: '09:15 AM', subject: 'English', teacherName: 'Ma\'am Anum Chaudhry', room: 'Room 104', className: 'Class 10', section: 'A' },
  { id: 'tt-5', day: 'Tuesday', startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Pakistan Studies', teacherName: 'Prof. Sajjad Ali', room: 'Room 104', className: 'Class 10', section: 'A' },
  { id: 'tt-6', day: 'Wednesday', startTime: '08:30 AM', endTime: '09:15 AM', subject: 'Physics', teacherName: 'Sir Farooq Ahmed', room: 'Lab 1', className: 'Class 10', section: 'A' },
  { id: 'tt-7', day: 'Thursday', startTime: '09:15 AM', endTime: '10:00 AM', subject: 'Computer Science', teacherName: 'Sir Bilal Tariq', room: 'Comp Lab 2', className: 'Class 10', section: 'A' },
  { id: 'tt-8', day: 'Friday', startTime: '08:30 AM', endTime: '09:30 AM', subject: 'Islamic Studies / Ethics', teacherName: 'Ma\'am Bushra Kazmi', room: 'Main Hall', className: 'Class 10', section: 'A' }
];

export const sampleFeeInvoices: FeeInvoice[] = [
  {
    id: 'inv-101',
    invoiceNo: 'INV-2026-0801',
    studentId: 'std-1',
    studentName: 'Muhammad Aayan Khan',
    rollNo: 'IMC-104',
    className: 'Class 10-A',
    month: 'August 2026',
    amountPKR: 18500,
    discountPKR: 0,
    netAmountPKR: 18500,
    dueDate: '2026-08-10',
    status: 'Paid',
    paymentMethod: 'EasyPaisa',
    paidDate: '2026-08-04'
  },
  {
    id: 'inv-102',
    invoiceNo: 'INV-2026-0802',
    studentId: 'std-2',
    studentName: 'Zoya Rashid Khan',
    rollNo: 'IMC-108',
    className: 'Class 8-B',
    month: 'August 2026',
    amountPKR: 16000,
    discountPKR: 1000, // Sibling Discount
    netAmountPKR: 15000,
    dueDate: '2026-08-15',
    status: 'Pending'
  },
  {
    id: 'inv-103',
    invoiceNo: 'INV-2026-0803',
    studentId: 'std-4',
    studentName: 'Hamza Bilal',
    rollNo: 'IMC-115',
    className: 'Class 9-Science',
    month: 'August 2026',
    amountPKR: 17500,
    discountPKR: 0,
    netAmountPKR: 17500,
    dueDate: '2026-08-05',
    status: 'Overdue'
  }
];

export const sampleAnnouncements: Announcement[] = [
  {
    id: 'anc-1',
    title: 'Midterm Board Examination Schedule Released',
    content: 'The date sheet for the upcoming Midterm Board Examination (FBISE pattern) has been uploaded. Exams start on August 25, 2026.',
    targetRole: 'All',
    author: 'Principal\'s Office',
    date: '2026-08-08',
    priority: 'Urgent',
    category: 'Academic'
  },
  {
    id: 'anc-2',
    title: 'Parent-Teacher Meeting (PTM) Invitation',
    content: 'All parents are cordially invited to attend the quarterly PTM on Saturday, August 16th from 09:00 AM to 01:00 PM to discuss First Term academic progress.',
    targetRole: 'Parents',
    author: 'Academic Coordination',
    date: '2026-08-07',
    priority: 'High',
    category: 'Administrative'
  },
  {
    id: 'anc-3',
    title: 'Monthly Tuition Fee Voucher Reminder',
    content: 'Fee vouchers for August 2026 have been issued. Kindly deposit fees before August 15th to avoid late payment surcharge (PKR 500).',
    targetRole: 'Parents',
    author: 'Accounts Dept',
    date: '2026-08-02',
    priority: 'Normal',
    category: 'Fee Alert'
  }
];

export const sampleMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'tch-1',
    senderName: 'Sir Farooq Ahmed',
    senderRole: 'teacher',
    recipientId: 'usr-prn-1',
    recipientName: 'Chaudhry Rashid Khan',
    recipientRole: 'parent',
    subject: 'Regarding Aayan\'s Physics Olympiad Selection',
    text: 'Respected Rashid Sb, Aayan has performed exceptionally well in the Physics test. We would like to enroll him in the National Science Olympiad prep.',
    timestamp: '2026-08-09 11:20 AM',
    unread: true,
    childContext: 'Muhammad Aayan Khan (Class 10-A)'
  },
  {
    id: 'msg-2',
    senderId: 'usr-prn-1',
    senderName: 'Chaudhry Rashid Khan',
    senderRole: 'parent',
    recipientId: 'tch-4',
    recipientName: 'Ma\'am Anum Chaudhry',
    recipientRole: 'teacher',
    subject: 'Zoya\'s Absence on Friday',
    text: 'Respected Ma\'am, Zoya was unable to attend school on Friday due to fever. Medical certificate is attached.',
    timestamp: '2026-08-08 04:45 PM',
    unread: false,
    childContext: 'Zoya Rashid Khan (Class 8-B)'
  }
];

export const sampleChildrenInfo: ChildInfo[] = [
  {
    id: 'std-1',
    name: 'Muhammad Aayan Khan',
    rollNo: 'IMC-104',
    className: 'Class 10',
    section: 'A (Pre-Engineering)',
    gpa: 3.85,
    attendancePct: 94,
    feeStatus: 'Paid',
    pendingAmountPKR: 0,
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    recentGrades: [
      { subject: 'Mathematics', score: '94 / 100', date: 'Jul 15, 2026', grade: 'A1' },
      { subject: 'Physics Test', score: '46 / 50', date: 'Jul 22, 2026', grade: 'A1' },
      { subject: 'Chemistry Quiz', score: '19 / 20', date: 'Aug 02, 2026', grade: 'A1' }
    ],
    alerts: [
      { id: 'alt-1', type: 'info', text: 'Midterm Board Exams schedule announced for Aug 25', date: 'Aug 08' },
      { id: 'alt-2', type: 'warning', text: 'Physics assignment due on Aug 15', date: 'Aug 09' }
    ],
    teacherContacts: [
      { teacherName: 'Sir Farooq Ahmed', subject: 'Physics', email: 'farooq.physics@imca.edu.pk', phone: '+92 321 5544332' },
      { teacherName: 'Ma\'am Sadia Naz', subject: 'Mathematics', email: 'sadia.math@imca.edu.pk', phone: '+92 300 4433221' }
    ]
  },
  {
    id: 'std-2',
    name: 'Zoya Rashid Khan',
    rollNo: 'IMC-108',
    className: 'Class 8',
    section: 'B',
    gpa: 3.65,
    attendancePct: 78, // Alert threshold
    feeStatus: 'Pending',
    pendingAmountPKR: 15000,
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    recentGrades: [
      { subject: 'General Science', score: '38 / 50', date: 'Jul 20, 2026', grade: 'B' },
      { subject: 'English Dictation', score: '18 / 20', date: 'Aug 01, 2026', grade: 'A' }
    ],
    alerts: [
      { id: 'alt-3', type: 'danger', text: 'Attendance dropped below 80% (Currently 78%)', date: 'Aug 09' },
      { id: 'alt-4', type: 'warning', text: 'Fee payment pending (PKR 15,000 due Aug 15)', date: 'Aug 02' }
    ],
    teacherContacts: [
      { teacherName: 'Ma\'am Anum Chaudhry', subject: 'Class Teacher & English', email: 'anum.eng@imca.edu.pk', phone: '+92 312 7766554' }
    ]
  }
];
