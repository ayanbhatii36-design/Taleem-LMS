import React, { useState, useEffect } from 'react';
import { UserRole, Student, Teacher, Course, Assignment, Exam, GradeRecord, TimetableSlot, FeeInvoice, Announcement, Message, InstituteInfo, ChildInfo } from './types';
import {
  initialInstitute,
  sampleUsers,
  sampleStudents,
  sampleTeachers,
  sampleClasses,
  sampleCourses,
  sampleAssignments,
  sampleExams,
  sampleGradeRecords as sampleGrades,
  sampleTimetable,
  sampleFeeInvoices,
  sampleAnnouncements,
  sampleMessages,
  sampleChildrenInfo as sampleChildren
} from './data/mockData';

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
import { LoginModal } from './components/auth/LoginModal';
import { OnboardingModal } from './components/auth/OnboardingModal';

export default function App() {
  // App state
  const [currentRole, setCurrentRole] = useState<UserRole>('student');
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
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);

  // Data state
  const [institute, setInstitute] = useState<InstituteInfo>(initialInstitute);
  const [students, setStudents] = useState<Student[]>(sampleStudents);
  const [teachers, setTeachers] = useState<Teacher[]>(sampleTeachers);
  const [classes] = useState(sampleClasses);
  const [courses, setCourses] = useState<Course[]>(sampleCourses);
  const [assignments, setAssignments] = useState<Assignment[]>(sampleAssignments);
  const [exams, setExams] = useState<Exam[]>(sampleExams);
  const [grades] = useState<GradeRecord[]>(sampleGrades);
  const [timetable] = useState<TimetableSlot[]>(sampleTimetable);
  const [feeInvoices, setFeeInvoices] = useState<FeeInvoice[]>(sampleFeeInvoices);
  const [announcements, setAnnouncements] = useState<Announcement[]>(sampleAnnouncements);
  const [messages, setMessages] = useState<Message[]>(sampleMessages);
  const [childrenList] = useState<ChildInfo[]>(sampleChildren);

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

  // Current user based on role
  const currentUser = sampleUsers[currentRole];

  // Actions
  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    setActiveTab('dashboard');
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
  };

  const handleEditStudent = (updatedStudent: Student) => {
    setStudents(students.map((s) => (s.id === updatedStudent.id ? updatedStudent : s)));
  };

  const handleDeleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
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
  };

  const handleDeleteTeacher = (id: string) => {
    setTeachers(teachers.filter((t) => t.id !== id));
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
  };

  const handlePayInvoice = (id: string, method: string) => {
    setFeeInvoices(
      feeInvoices.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: 'Paid',
              paymentMethod: method as any,
              paidDate: new Date().toISOString().slice(0, 10)
            }
          : inv
      )
    );
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
  };

  const handleUpdateInstitute = (updatedData: Partial<InstituteInfo>) => {
    setInstitute({ ...institute, ...updatedData });
  };

  // Unread messages count
  const unreadCount = messages.filter((m) => m.unread).length;

  if (showLandingPage) {
    return (
      <LandingPage
        onOpenLogin={() => {
          setShowLandingPage(false);
          setShowLoginModal(true);
        }}
        onQuickDemo={(role) => {
          setCurrentRole(role);
          setActiveTab('dashboard');
          setShowLandingPage(false);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
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
        onOpenLogin={() => setShowLoginModal(true)}
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
                  student={sampleStudents[0]}
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

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={(role) => {
            setCurrentRole(role);
            setActiveTab('dashboard');
            setShowLoginModal(false);
          }}
        />
      )}

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
