import React, { useState, useEffect } from 'react';
import { UserRole, Student, Teacher, ClassItem, Course, Assignment, Exam, GradeRecord, TimetableSlot, FeeInvoice, Announcement, Message, InstituteInfo, ChildInfo } from './types';
import { initialInstitute } from './data/mockData';

// Backend API layer
import { AuthUser, clearSession, getStoredUser } from './api/client';
import { authApi } from './api/auth';
import {
  studentsApi, teachersApi, feesApi, lmsApi, examsApi,
  timetableApi, communicationApi, academicsApi
} from './api/services';
import {
  mapStudent, mapTeacher, mapInvoice, mapAssignment, mapExam,
  mapTimetableSlot, mapAnnouncement, mapMessage, mapList
} from './api/mappers';

// Layout & Common Components
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { SearchModal } from './components/common/SearchModal';
import { NotificationDrawer } from './components/common/NotificationDrawer';

// Dashboards
import { StudentDashboard } from './components/dashboards/StudentDashboard';
import { TeacherDashboard } from './components/dashboards/TeacherDashboard';
import { PrincipalDashboard } from './components/dashboards/PrincipalDashboard';
import { ParentDashboard } from './components/dashboards/ParentDashboard';

// Modules
import { StudentManagement } from './components/modules/StudentManagement';
import { TeacherManagement } from './components/modules/TeacherManagement';
import { AcademicStructure } from './components/modules/AcademicStructure';
import { AttendanceModule } from './components/modules/AttendanceModule';
import { AssessmentModule } from './components/modules/AssessmentModule';
import { TimetableModule } from './components/modules/TimetableModule';
import { FeeManagement } from './components/modules/FeeManagement';
import { CommunicationModule } from './components/modules/CommunicationModule';
import { AnalyticsReports } from './components/modules/AnalyticsReports';
import { InstituteSettings } from './components/modules/InstituteSettings';

// Auth Components
import { LandingPage } from './components/auth/LandingPage';
import { AuthPage } from './components/auth/AuthPage';
import { OnboardingModal } from './components/auth/OnboardingModal';

// SaaS Super Admin Master Module
import { SuperAdminDashboard } from './superadmin/components/SuperAdminDashboard';
import { ImpersonationBanner } from './superadmin/components/ImpersonationBanner';
import { SchoolTenant } from './superadmin/types';

export default function App() {
  // Route separation: /admin (Super Admin domain) vs / (School portal domain)
  const [currentPath, setCurrentPath] = useState<string>(window.location.pathname);

  useEffect(() => {
    const onPopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const isSuperAdminRoute = currentPath.startsWith('/admin');
  const [activeImpersonation, setActiveImpersonation] = useState<{
    role: string;
    name: string;
    schoolName: string;
  } | null>(null);

  // App state
  const [currentRole, setCurrentRole] = useState<UserRole>('principal');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('taleem_theme');
    if (saved !== null) {
      return saved === 'dark';
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const [authView, setAuthView] = useState<{ role: UserRole; mode: 'signin' | 'signup' } | null>(null);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [backendUser, setBackendUser] = useState<AuthUser | null>(() => getStoredUser());
  const [dataSynced, setDataSynced] = useState<boolean>(false);

  // Data state — hydrated from the backend (MongoDB) after login
  const [institute, setInstitute] = useState<InstituteInfo>(initialInstitute);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [grades, setGrades] = useState<GradeRecord[]>([]);
  const [timetable, setTimetable] = useState<TimetableSlot[]>([]);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoice[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [childrenList, setChildrenList] = useState<ChildInfo[]>([]);

  // Sync dark mode class with html / body element and persist preference
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      localStorage.setItem('taleem_theme', 'dark');
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      localStorage.setItem('taleem_theme', 'light');
    }
  }, [isDarkMode]);

  // Current user (authenticated backend identity, or a neutral guest for demo mode)
  const currentUser = backendUser
    ? {
        id: backendUser.id,
        name: backendUser.full_name,
        email: backendUser.email,
        phone: backendUser.phone,
        role: currentRole,
        instituteName: backendUser.institute_name || institute.name
      }
    : {
        id: 'guest',
        name: 'Guest (Demo Mode)',
        email: '',
        phone: '',
        role: currentRole,
        instituteName: institute.name
      };

  // ------------------------------------------------------ Backend data sync
  // When authenticated, hydrate app state from the backend API (MongoDB).
  useEffect(() => {
    if (!backendUser || dataSynced) return;

    let cancelled = false;
    (async () => {
      try {
        const [studentsRes, teachersRes, invoicesRes, assignmentsRes, examsRes, timetableRes, announcementsRes, messagesRes, coursesRes, classesRes, gradesRes, meRes] =
          await Promise.allSettled([
            studentsApi.list(),
            teachersApi.list(),
            feesApi.invoices(),
            lmsApi.assignments(),
            examsApi.list(),
            timetableApi.list(),
            communicationApi.announcements(),
            communicationApi.messages(),
            academicsApi.courses(),
            academicsApi.classes(),
            examsApi.grades(),
            authApi.me()
          ]);

        if (cancelled) return;

        if (studentsRes.status === 'fulfilled') setStudents(mapList(studentsRes.value, mapStudent));
        if (teachersRes.status === 'fulfilled') setTeachers(mapList(teachersRes.value, mapTeacher));
        if (invoicesRes.status === 'fulfilled') setFeeInvoices(mapList(invoicesRes.value, mapInvoice));
        if (assignmentsRes.status === 'fulfilled') setAssignments(mapList(assignmentsRes.value, mapAssignment));
        if (examsRes.status === 'fulfilled') setExams(mapList(examsRes.value, mapExam));
        if (timetableRes.status === 'fulfilled') setTimetable(mapList(timetableRes.value, mapTimetableSlot));
        if (announcementsRes.status === 'fulfilled') setAnnouncements(mapList(announcementsRes.value, mapAnnouncement));
        if (messagesRes.status === 'fulfilled') setMessages(mapList(messagesRes.value, mapMessage));
        if (coursesRes.status === 'fulfilled') {
          const backendCourses = coursesRes.value;
          if (backendCourses.length > 0) {
            setCourses(
              backendCourses.map((c) => ({
                id: c.id,
                code: c.code || c.id,
                title: c.title || 'Course',
                instructor: c.teacher_name || 'Faculty Member',
                className: c.class_name || '',
                section: c.section_name || '',
                progress: 0,
                description: c.description || '',
                modulesCount: 0,
                enrolledStudents: 0,
                coverImage: c.thumbnail_url || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80',
                modules: []
              }))
            );
          }
        }
        if (classesRes.status === 'fulfilled') {
          const backendClasses = classesRes.value;
          if (backendClasses.length > 0) {
            setClasses(
              backendClasses.map((c) => ({
                id: c.id,
                name: c.name || '',
                section: 'A',
                classTeacher: '',
                studentCount: 0,
                subjectsCount: 0,
                attendancePct: 0,
                gpaAverage: 0,
                department: '',
                subjects: []
              }))
            );
            setClasses((prev) =>
              prev.map((cls) => ({
                ...cls,
                studentCount: students.filter((s) => s.className === cls.name).length
              }))
            );
          }
        }
        if (gradesRes.status === 'fulfilled') {
          const backendGrades = gradesRes.value;
          if (backendGrades.length > 0) {
            setGrades(
              backendGrades.map((g) => ({
                id: g.id,
                studentId: g.student_id,
                studentName: g.student_name || '',
                rollNo: g.roll_no || '',
                className: g.class_name || '',
                subject: g.subject_name || '',
                examTitle: g.exam_title || '',
                marksObtained: g.marks_obtained ?? 0,
                totalMarks: g.total_marks ?? 100,
                percentage: g.total_marks ? Math.round(((g.marks_obtained ?? 0) / g.total_marks) * 100) : 0,
                gradeLetter: g.grade_letter || '',
                remarks: g.remarks || '',
                date: g.created_at || ''
              }))
            );
          }
        }
        if (meRes.status === 'fulfilled' && meRes.value.profileDetails?.parent) {
          const children = (meRes.value.profileDetails as any).children as any[] | undefined;
          if (children && children.length > 0) {
            setChildrenList(
              children.map((c) => ({
                id: c.id,
                name: c.full_name,
                rollNo: c.roll_no,
                className: c.class_name || '',
                section: c.section_name || '',
                gpa: 0,
                attendancePct: 0,
                feeStatus: 'Paid' as const,
                pendingAmountPKR: 0,
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
                recentGrades: [],
                alerts: [],
                teacherContacts: []
              }))
            );
          }
        }
        if (meRes.status === 'fulfilled' && meRes.value.institute) {
          const inst = meRes.value.institute;
          setInstitute((prev) => ({
            ...prev,
            name: inst.name || prev.name,
            address: inst.address || prev.address,
            city: inst.city || prev.city,
            phone: inst.phone || prev.phone,
            email: inst.email || prev.email
          }));
        }
        if (announcementsRes.status === 'fulfilled' || invoicesRes.status === 'fulfilled') {
          setDataSynced(true);
        }
      } catch {
        // API unavailable — the app stays in an honest empty state
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [backendUser, dataSynced]);

  // Actions
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveTab('dashboard');
  };

  const handleLoginSuccess = (role: UserRole, user?: AuthUser) => {
    if (user) {
      setBackendUser(user);
      setDataSynced(false);
      const backendRole = (user.role as string) as UserRole;
      const mappedRole =
        backendRole === 'teacher' || backendRole === 'student' || backendRole === 'parent'
          ? backendRole
          : 'principal';
      setCurrentRole(mappedRole);
    } else {
      setCurrentRole(role);
    }
    setActiveTab('dashboard');
    setShowLandingPage(false);
    setAuthView(null);
  };

  const handleLogout = () => {
    clearSession();
    setBackendUser(null);
    setDataSynced(false);
  };

  const handleAddStudent = (newStudentData: Partial<Student>) => {
    const newStudent: Student = {
      id: `std-${Date.now()}`,
      rollNo: newStudentData.rollNo || `IMC-${Math.floor(100 + Math.random() * 900)}`,
      name: newStudentData.name || 'New Student',
      guardianName: newStudentData.guardianName || 'Guardian',
      phone: newStudentData.phone || '+92 300 0000000',
      email: newStudentData.email || 'student@school.edu.pk',
      className: newStudentData.className || 'Class 10',
      section: newStudentData.section || 'A',
      status: 'Active',
      admissionYear: '2025',
      gpa: 3.5,
      attendancePct: 90,
      feeStatus: 'Paid',
      feeAmountPKR: 18500,
      address: newStudentData.address || 'Islamabad, Pakistan',
      cnicBForm: newStudentData.cnicBForm || '61101-0000000-0',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      subjects: ['Physics', 'Chemistry', 'Mathematics', 'English', 'Urdu']
    };
    setStudents([newStudent, ...students]);
    if (backendUser) {
      studentsApi
        .create({
          full_name: newStudent.name,
          roll_no: newStudent.rollNo,
          guardian_name: newStudent.guardianName,
          guardian_phone: newStudent.phone,
          gender: 'MALE',
          dob: '2009-01-01',
          cnic_bform: newStudent.cnicBForm,
          class_id: '',
          section_id: '',
          academic_year_id: '',
          address: newStudent.address
        })
        .catch(() => {});
    }
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
    if (backendUser) studentsApi.remove(id).catch(() => {});
  };

  const handleAddTeacher = (newTeacherData: Partial<Teacher>) => {
    const newTeacher: Teacher = {
      id: `tch-${Date.now()}`,
      empId: newTeacherData.empId || `TCH-${Math.floor(200 + Math.random() * 800)}`,
      name: newTeacherData.name || 'New Teacher',
      email: newTeacherData.email || 'teacher@school.edu.pk',
      phone: newTeacherData.phone || '+92 300 0000000',
      designation: newTeacherData.designation || 'Lecturer',
      qualification: newTeacherData.qualification || 'M.Sc',
      department: newTeacherData.department || 'Science',
      subjects: newTeacherData.subjects || ['Physics'],
      assignedClasses: newTeacherData.assignedClasses || ['Class 10-A'],
      attendancePct: 96,
      performanceRating: 4.8,
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=120&auto=format&fit=crop&q=80',
      status: 'Active'
    };
    setTeachers([newTeacher, ...teachers]);
    if (backendUser) {
      teachersApi
        .create({
          full_name: newTeacher.name,
          emp_id: newTeacher.empId,
          designation: newTeacher.designation,
          qualification: newTeacher.qualification
        })
        .catch(() => {});
    }
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
    if (backendUser) teachersApi.remove(id).catch(() => {});
  };

  const handleAddCourse = (courseData: Partial<Course>) => {
    const newCourse: Course = {
      id: `crs-${Date.now()}`,
      code: courseData.code || 'CRS-100',
      title: courseData.title || 'New Course',
      instructor: courseData.instructor || 'Faculty Member',
      className: courseData.className || 'Class 10',
      section: courseData.section || 'A',
      progress: 0,
      description: courseData.description || 'Course overview',
      modulesCount: 4,
      enrolledStudents: 35,
      coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=500&auto=format&fit=crop&q=80',
      modules: []
    };
    setCourses([...courses, newCourse]);
    if (backendUser) {
      lmsApi
        .createAssignment({
          title: newCourse.title,
          course_id: newCourse.id,
          class_id: '',
          section_id: '',
          subject_id: '',
          teacher_id: backendUser.id,
          description: newCourse.description,
          due_date: new Date(Date.now() + 14 * 86400000).toISOString(),
          total_marks: 100
        })
        .catch(() => {});
    }
  };

  const handleAddAssignment = (asgData: Partial<Assignment>) => {
    const newAsg: Assignment = {
      id: `asg-${Date.now()}`,
      title: asgData.title || 'New Assignment',
      subject: asgData.subject || 'Physics',
      className: asgData.className || 'Class 10',
      section: asgData.section || 'A',
      teacherName: currentUser.name,
      dueDate: asgData.dueDate || new Date().toISOString().slice(0, 10),
      totalMarks: asgData.totalMarks || 50,
      submissionStatus: 'Pending',
      instructions: asgData.instructions || 'Complete exercises and submit PDF.',
      fileCount: 1,
      submissionsCount: 0,
      totalStudentsCount: 38
    };
    setAssignments([newAsg, ...assignments]);
    if (backendUser) {
      lmsApi
        .createAssignment({
          title: newAsg.title,
          class_id: '',
          section_id: '',
          subject_id: '',
          teacher_id: backendUser.id,
          description: newAsg.instructions,
          due_date: newAsg.dueDate,
          total_marks: newAsg.totalMarks
        })
        .catch(() => {});
    }
  };

  const handleAddExam = (examData: Partial<Exam>) => {
    const newExam: Exam = {
      id: `exm-${Date.now()}`,
      title: examData.title || 'Term Exam',
      subject: examData.subject || 'Mathematics',
      className: examData.className || 'Class 10',
      section: examData.section || 'A',
      date: examData.date || new Date().toISOString().slice(0, 10),
      time: examData.time || '09:00 AM',
      duration: examData.duration || '2 Hours',
      totalMarks: examData.totalMarks || 100,
      passingMarks: examData.passingMarks || 33,
      roomNo: examData.roomNo || 'Hall 1',
      term: examData.term || 'Midterm',
      status: 'Upcoming'
    };
    setExams([newExam, ...exams]);
    if (backendUser) {
      examsApi
        .create({
          title: newExam.title,
          term_id: '',
          academic_year_id: '',
          start_date: newExam.date,
          end_date: newExam.date,
          status: 'SCHEDULED'
        })
        .catch(() => {});
    }
  };

  const handlePayInvoice = (id: string, method: string) => {
    const invoice = feeInvoices.find((inv) => inv.id === id);
    const paymentMethodMap: Record<string, FeeInvoice['paymentMethod']> = {
      'JazzCash': 'JazzCash',
      'EasyPaisa': 'EasyPaisa',
      'Bank Transfer': 'Bank Transfer',
      'Cash Deposit': 'Cash Deposit',
      'HBL Direct': 'HBL Direct'
    };
    setFeeInvoices(
      feeInvoices.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'Paid',
              paymentMethod: paymentMethodMap[method] || 'Cash Deposit',
              paidDate: new Date().toISOString().slice(0, 10)
            }
          : inv
      )
    );
    if (backendUser && invoice) {
      feesApi
        .collectPayment(id, {
          amount_pkr: invoice.netAmountPKR,
          payment_method:
            method === 'JazzCash' ? 'JAZZCASH' : method === 'EasyPaisa' ? 'EASYPAISA' : method === 'Bank Transfer' ? 'BANK_TRANSFER' : 'CASH'
        })
        .catch(() => {});
    }
  };

  const handleSendMessage = (msgData: Partial<Message>) => {
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentRole,
      recipientId: msgData.recipientId || 'all',
      recipientName: msgData.recipientName || 'Faculty / Office',
      recipientRole: msgData.recipientRole || 'teacher',
      subject: msgData.subject || 'General Inquiry',
      text: msgData.text || '',
      timestamp: 'Just now',
      unread: false
    };
    setMessages([newMsg, ...messages]);
    if (backendUser) {
      communicationApi
        .sendMessage({
          recipient_id: newMsg.recipientId === 'all' ? '' : newMsg.recipientId,
          sender_id: backendUser.id,
          content: newMsg.text,
          conversation_id: `conv-${Date.now()}`
        })
        .catch(() => {});
    }
  };

  const handlePostAnnouncement = (ancData: Partial<Announcement>) => {
    const newAnc: Announcement = {
      id: `anc-${Date.now()}`,
      title: ancData.title || 'Notice',
      content: ancData.content || 'Important notification',
      targetRole: ancData.targetRole || 'All',
      author: currentUser.name,
      date: new Date().toISOString().slice(0, 10),
      priority: ancData.priority || 'Normal',
      category: ancData.category || 'Academic'
    };
    setAnnouncements([newAnc, ...announcements]);
    if (backendUser) {
      const targetRole = newAnc.targetRole;
      const targetRolesMap: Record<string, string[]> = {
        All: ['student', 'teacher', 'parent', 'administrator'],
        Students: ['student'],
        Parents: ['parent'],
        Teachers: ['teacher']
      };
      communicationApi
        .createAnnouncement({
          title: newAnc.title,
          content: newAnc.content,
          author_id: backendUser.id,
          author_name: backendUser.full_name,
          target_roles: targetRolesMap[targetRole] || ['student', 'teacher', 'parent'],
          priority: newAnc.priority === 'Urgent' ? 'URGENT' : newAnc.priority === 'High' ? 'HIGH' : 'NORMAL'
        })
        .catch(() => {});
    }
  };

  const handleUpdateInstitute = (updatedData: Partial<InstituteInfo>) => {
    setInstitute({ ...institute, ...updatedData });
  };

  // Unread messages count
  const unreadCount = messages.filter((m) => m.unread).length;

  if (showLandingPage) {
    return (
      <LandingPage
        onOpenAuth={(role, mode) => setAuthView({ role, mode })}
        onQuickDemo={(role) => {
          setCurrentRole(role);
          setActiveTab('dashboard');
          setShowLandingPage(false);
        }}
        onOpenSuperAdmin={() => navigate('/admin')}
      />
    );
  }

  if (authView) {
    return (
      <AuthPage
        key={`${authView.role}-${authView.mode}`}
        initialRole={authView.role}
        initialMode={authView.mode}
        onBack={() => setAuthView(null)}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  const handleLaunchSchoolPortal = (school: SchoolTenant, role: string = 'Principal') => {
    // Sync school name and details to institute state
    setInstitute(prev => ({
      ...prev,
      name: school.name,
      address: `${school.address}, ${school.city}, ${school.province}`,
      phone: school.phone,
      email: school.email,
      website: school.website || prev.website,
      logo: school.logo || prev.logo
    }));

    const mappedRole: UserRole = role.toLowerCase().includes('teach') 
      ? 'teacher' 
      : role.toLowerCase().includes('student') 
      ? 'student' 
      : role.toLowerCase().includes('parent') 
      ? 'parent' 
      : 'principal';

    setCurrentRole(mappedRole);
    setActiveTab('dashboard');
    setActiveImpersonation({
      role,
      name: school.principalName,
      schoolName: school.name
    });
    navigate('/');
  };

  const handleExitImpersonation = () => {
    setActiveImpersonation(null);
    navigate('/admin');
  };

  // Super Admin lives on its own route/domain (/admin) — fully separated
  // from the school portal. Map admin.taleemlms.com → /admin at the proxy.
  if (isSuperAdminRoute) {
    return (
      <SuperAdminDashboard
        onExitSuperAdmin={() => navigate('/')}
        onLaunchSchoolPortal={handleLaunchSchoolPortal}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Impersonation Banner if super admin is viewing this school */}
      {activeImpersonation && (
        <ImpersonationBanner
          impersonatedRole={activeImpersonation.role}
          impersonatedName={activeImpersonation.name}
          schoolName={activeImpersonation.schoolName}
          onStopImpersonation={handleExitImpersonation}
        />
      )}

      {/* Top Header */}
      <Header
        currentUser={currentUser}
        institute={institute}
        currentRole={currentRole}
        onRoleChange={handleRoleChange}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        onOpenSearch={() => setIsSearchOpen(true)}
        onToggleNotifications={() => setIsNotificationsOpen(!isNotificationsOpen)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)}
        unreadCount={unreadCount}
        onOpenOnboarding={() => setShowOnboardingModal(true)}
        onOpenLogin={() => setAuthView({ role: currentRole, mode: 'signin' })}
        onOpenSuperAdmin={() => navigate('/admin')}
        isImpersonating={!!activeImpersonation}
        isAuthenticated={!!backendUser}
        onLogout={handleLogout}
      />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Navigation Sidebar */}
        <Sidebar
          currentRole={currentRole}
          activeTab={activeTab}
          onTabChange={(tabId) => setActiveTab(tabId)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          unreadMessagesCount={unreadCount}
        />

        {/* Main Content Pane - High Density Layout */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {/* Active Tab Router */}
          {activeTab === 'dashboard' && (
            <>
              {currentRole === 'student' && (
                <StudentDashboard
                  student={students[0]}
                  courses={courses}
                  assignments={assignments}
                  exams={exams}
                  grades={grades}
                  timetable={timetable}
                  announcements={announcements}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                />
              )}
              {currentRole === 'teacher' && (
                <TeacherDashboard
                  teacher={teachers[0]}
                  classes={classes}
                  assignments={assignments}
                  exams={exams}
                  timetable={timetable}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                  onOpenTakeAttendance={() => setActiveTab('attendance')}
                  onOpenCreateAssignment={() => setActiveTab('assessments')}
                />
              )}
              {currentRole === 'principal' && (
                <PrincipalDashboard
                  students={students}
                  teachers={teachers}
                  classes={classes}
                  feeInvoices={feeInvoices}
                  announcements={announcements}
                  instituteName={institute.name}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                  onOpenAddStudent={() => setActiveTab('students')}
                  onOpenAddTeacher={() => setActiveTab('teachers')}
                  onOpenAddAnnouncement={() => setActiveTab('announcements')}
                />
              )}
              {currentRole === 'parent' && (
                <ParentDashboard
                  childrenList={childrenList}
                  onSelectTab={(tabId) => setActiveTab(tabId)}
                  onSendMessageToTeacher={(teacherName, subject, text) => {
                    handleSendMessage({ recipientName: teacherName, subject, text });
                  }}
                />
              )}
            </>
          )}

          {activeTab === 'students' && (
            <StudentManagement
              students={students}
              onAddStudent={handleAddStudent}
              onEditStudent={handleEditStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          )}

          {activeTab === 'teachers' && (
            <TeacherManagement
              teachers={teachers}
              onAddTeacher={handleAddTeacher}
              onDeleteTeacher={handleDeleteTeacher}
            />
          )}

          {activeTab === 'academic-structure' && (
            <AcademicStructure
              classes={classes}
              courses={courses}
              onAddCourse={handleAddCourse}
            />
          )}

          {activeTab === 'attendance' && (
            <AttendanceModule
              currentRole={currentRole}
              students={students}
              classes={classes}
            />
          )}

          {activeTab === 'assessments' && (
            <AssessmentModule
              currentRole={currentRole}
              assignments={assignments}
              exams={exams}
              grades={grades}
              onAddAssignment={handleAddAssignment}
              onAddExam={handleAddExam}
            />
          )}

          {activeTab === 'timetable' && (
            <TimetableModule timetable={timetable} />
          )}

          {activeTab === 'fees' && (
            <FeeManagement
              currentRole={currentRole}
              feeInvoices={feeInvoices}
              onPayInvoice={handlePayInvoice}
            />
          )}

          {(activeTab === 'announcements' || activeTab === 'messages') && (
            <CommunicationModule
              currentRole={currentRole}
              messages={messages}
              announcements={announcements}
              onSendMessage={handleSendMessage}
              onPostAnnouncement={handlePostAnnouncement}
            />
          )}

          {activeTab === 'reports' && <AnalyticsReports />}

          {activeTab === 'settings' && (
            <InstituteSettings
              institute={institute}
              onUpdateInstitute={handleUpdateInstitute}
            />
          )}
        </main>
      </div>

      {/* Modals & Overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        students={students}
        teachers={teachers}
        classes={classes}
        feeInvoices={feeInvoices}
        courses={courses}
        onNavigate={(tab) => {
          setActiveTab(tab);
          setIsSearchOpen(false);
        }}
      />

      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        announcements={announcements}
      />

      {showOnboardingModal && (
        <OnboardingModal
          role={currentRole}
          onComplete={() => {
            setShowOnboardingModal(false);
          }}
        />
      )}
    </div>
  );
}
