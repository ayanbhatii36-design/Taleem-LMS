import React from 'react';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  CalendarCheck,
  FileCheck,
  Award,
  Calendar,
  CreditCard,
  Bell,
  MessageSquare,
  BarChart3,
  Settings,
  BookMarked,
  Clock,
  Briefcase,
  Layers,
  HeartHandshake,
  FolderOpen,
  UserCheck,
  Shield,
  Send,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  currentRole: UserRole;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  unreadMessagesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentRole,
  activeTab,
  onTabChange,
  isMobileOpen,
  onCloseMobile,
  unreadMessagesCount = 2
}) => {
  // Navigation config per role strictly according to requirements
  const roleNavMap: Record<UserRole, { id: string; label: string; icon: React.ReactNode; badge?: string }[]> = {
    principal: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'students', label: 'Students', icon: <GraduationCap className="w-4 h-4" /> },
      { id: 'teachers', label: 'Teachers', icon: <Users className="w-4 h-4" /> },
      { id: 'academic-structure', label: 'Academic Structure', icon: <Layers className="w-4 h-4" /> },
      { id: 'attendance', label: 'Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'assessments', label: 'Assignments & Exams', icon: <Award className="w-4 h-4" /> },
      { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
      { id: 'fees', label: 'Fee Management (PKR)', icon: <CreditCard className="w-4 h-4" /> },
      { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
      { id: 'messages', label: 'Messages', icon: <MessageSquare className="w-4 h-4" />, badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined },
      { id: 'reports', label: 'Analytics & Reports', icon: <BarChart3 className="w-4 h-4" /> },
      { id: 'settings', label: 'Institute Settings', icon: <Settings className="w-4 h-4" /> }
    ],
    teacher: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'academic-structure', label: 'My Classes & Courses', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'students', label: 'Students List', icon: <GraduationCap className="w-4 h-4" /> },
      { id: 'attendance', label: 'Take Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'assessments', label: 'Assignments & Exams', icon: <Award className="w-4 h-4" /> },
      { id: 'timetable', label: 'My Timetable', icon: <Clock className="w-4 h-4" /> },
      { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
      { id: 'messages', label: 'Messages & Parents', icon: <MessageSquare className="w-4 h-4" />, badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined },
      { id: 'settings', label: 'Profile Settings', icon: <Settings className="w-4 h-4" /> }
    ],
    student: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'academic-structure', label: 'My Courses & Material', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'assessments', label: 'Assignments & Exams', icon: <Award className="w-4 h-4" /> },
      { id: 'attendance', label: 'My Attendance', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'timetable', label: 'My Timetable & Calendar', icon: <Clock className="w-4 h-4" /> },
      { id: 'fees', label: 'Fee Vouchers', icon: <CreditCard className="w-4 h-4" /> },
      { id: 'announcements', label: 'Announcements', icon: <Bell className="w-4 h-4" /> },
      { id: 'messages', label: 'Messages & Teachers', icon: <MessageSquare className="w-4 h-4" /> },
      { id: 'settings', label: 'Profile', icon: <Settings className="w-4 h-4" /> }
    ],
    parent: [
      { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { id: 'students', label: 'My Children', icon: <Users className="w-4 h-4" /> },
      { id: 'attendance', label: 'Attendance Record', icon: <CalendarCheck className="w-4 h-4" /> },
      { id: 'assessments', label: 'Academic Performance', icon: <Award className="w-4 h-4" /> },
      { id: 'timetable', label: 'Timetable', icon: <Clock className="w-4 h-4" /> },
      { id: 'fees', label: 'Fees & Invoices (PKR)', icon: <CreditCard className="w-4 h-4" /> },
      { id: 'messages', label: 'Teacher Communication', icon: <HeartHandshake className="w-4 h-4" />, badge: unreadMessagesCount > 0 ? String(unreadMessagesCount) : undefined },
      { id: 'announcements', label: 'School Notices', icon: <Bell className="w-4 h-4" /> },
      { id: 'settings', label: 'Parent Profile', icon: <Settings className="w-4 h-4" /> }
    ]
  };

  const navItems = roleNavMap[currentRole] || roleNavMap.principal;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-64">
      {/* Mobile Header Close */}
      <div className="flex items-center justify-between p-4 md:hidden border-b border-slate-100 dark:border-slate-800">
        <span className="text-sm font-bold text-slate-800 dark:text-white capitalize">
          {currentRole} Navigation
        </span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role Badge Indicator */}
      <div className="px-4 py-3 mx-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center gap-3">
        <div className="p-2 rounded-xl bg-teal-600 text-white shadow-sm font-bold text-xs uppercase">
          {currentRole.slice(0, 2)}
        </div>
        <div className="truncate">
          <p className="text-xs font-bold text-slate-900 dark:text-white capitalize truncate">
            {currentRole === 'principal' ? 'Super Admin' : currentRole} Mode
          </p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
            Pakistani Education Suite
          </p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                if (isMobileOpen) onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                isActive
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                  isActive
                    ? 'bg-white text-teal-800'
                    : 'bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 text-center">
        <p className="font-semibold text-slate-600 dark:text-slate-400">TaleemLM v2.5</p>
        <p>Built for Pakistan Institutions</p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block h-[calc(100vh-57px)] sticky top-[57px] shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative flex-1 max-w-xs w-full bg-white dark:bg-slate-900 z-10 shadow-2xl">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
