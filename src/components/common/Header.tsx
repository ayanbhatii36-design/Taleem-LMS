import React, { useState } from 'react';
import {
  Search,
  Bell,
  MessageSquare,
  Sun,
  Moon,
  ChevronDown,
  UserCheck,
  Building2,
  Menu,
  Shield,
  GraduationCap,
  Users,
  User,
  LogOut,
  Sparkles
} from 'lucide-react';
import { UserRole, InstituteInfo, User as UserType } from '../../types';

interface HeaderProps {
  currentUser: UserType;
  institute: InstituteInfo;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenSearch: () => void;
  onToggleNotifications: () => void;
  onToggleMobileSidebar: () => void;
  unreadCount: number;
  onOpenOnboarding: () => void;
  onOpenLogin: () => void;
  onOpenSuperAdmin?: () => void;
  isImpersonating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  institute,
  currentRole,
  onRoleChange,
  isDarkMode,
  onToggleDarkMode,
  onOpenSearch,
  onToggleNotifications,
  onToggleMobileSidebar,
  unreadCount,
  onOpenOnboarding,
  onOpenLogin,
  onOpenSuperAdmin,
  isImpersonating
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const roleLabels: Record<UserRole, { title: string; badge: string; icon: React.ReactNode; color: string }> = {
    principal: { title: 'Principal / Admin Portal', badge: 'Super Admin', icon: <Shield className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' },
    teacher: { title: 'Faculty & Teacher Portal', badge: 'Teacher', icon: <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />, color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300 dark:border-blue-700' },
    student: { title: 'Student Portal', badge: 'Student', icon: <GraduationCap className="w-4 h-4 text-purple-600 dark:text-purple-400" />, color: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300 dark:border-purple-700' },
    parent: { title: 'Parent Guardian Portal', badge: 'Parent', icon: <Users className="w-4 h-4 text-amber-600 dark:text-amber-400" />, color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700' }
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="flex items-center justify-between px-4 py-2.5 md:px-6">
        {/* Left Section: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleMobileSidebar}
            className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 md:hidden"
            aria-label="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-teal-700 text-white shadow-md shadow-teal-700/20 font-bold overflow-hidden">
              {institute.logo ? (
                <img src={institute.logo} alt={institute.name} className="w-full h-full object-cover" />
              ) : (
                <Building2 className="w-5 h-5" />
              )}
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                  {institute.name}
                </h1>
                <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-teal-100 dark:bg-teal-900/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                  PKR LMS
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-xs">
                {institute.tagline}
              </p>
            </div>
          </div>
        </div>

        {/* Center: Search Trigger (Desktop) */}
        <div className="hidden lg:flex items-center flex-1 max-w-md mx-8">
          <button
            onClick={onOpenSearch}
            className="w-full flex items-center gap-3 px-3.5 py-2 text-sm text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-xl transition-all shadow-inner"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="flex-1 text-left truncate">Search students, classes, subjects, fees...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded shadow-xs">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right Section: Role Switcher, Theme Toggle, Notifications, Profile */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Quick Role Switcher Demo Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all ${roleLabels[currentRole].color}`}
              title="Switch user role view for testing"
            >
              {roleLabels[currentRole].icon}
              <span className="hidden sm:inline font-semibold">{roleLabels[currentRole].badge} View</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700/60">
                  <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Role Switcher (Demo Mode)
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Experience all 4 persona dashboards:
                  </p>
                </div>
                <div className="py-1 space-y-0.5">
                  {(['principal', 'teacher', 'student', 'parent'] as UserRole[]).map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        onRoleChange(r);
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl font-medium transition-colors ${
                        currentRole === r
                          ? 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 font-semibold'
                          : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {roleLabels[r].icon}
                        <span className="capitalize">{r === 'principal' ? 'Principal / Super Admin' : r}</span>
                      </div>
                      {currentRole === r && (
                        <span className="w-2 h-2 rounded-full bg-teal-600 dark:bg-teal-400" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Search Trigger (Mobile) */}
          <button
            onClick={onOpenSearch}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onToggleNotifications}
            className="relative p-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-teal-600/30 dark:ring-teal-400/30"
              />
              <div className="hidden xl:block text-left">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="hidden xl:block w-3.5 h-3.5 text-slate-400" />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-1.5 z-50">
                <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-700/60">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                  <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {currentUser.phone}
                  </span>
                </div>
                <div className="py-1 space-y-0.5">
                  <button
                    onClick={() => {
                      onOpenOnboarding();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-xl font-medium"
                  >
                    <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Setup & Onboarding Wizard
                  </button>
                  {onOpenSuperAdmin && (
                    <button
                      onClick={() => {
                        onOpenSuperAdmin();
                        setShowProfileMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl font-bold"
                    >
                      <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Super Admin Platform Dashboard
                    </button>
                  )}
                  <button
                    onClick={() => {
                      onOpenLogin();
                      setShowProfileMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out / Switch Account
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
