import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  LifeBuoy,
  Activity,
  Sun,
  Moon,
  ShieldCheck,
  ChevronDown,
  Settings,
  LogOut,
  ShieldAlert,
  Building2,
  Sparkles,
  Command,
  Server,
  Menu
} from 'lucide-react';
import { SuperAdminTeamMember, SupportTicket, SystemServiceStatus, SchoolTenant, PaymentTransaction } from '../types';
import { INITIAL_SUPER_ADMIN } from '../data';

interface SuperAdminTopNavProps {
  currentAdmin?: SuperAdminTeamMember;
  adminUser?: SuperAdminTeamMember;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenCommandPalette: () => void;
  supportTickets?: SupportTicket[];
  systemServices?: SystemServiceStatus[];
  schools?: SchoolTenant[];
  transactions?: PaymentTransaction[];
  onNavigateTab?: (tabId: string) => void;
  onOpenSettings?: () => void;
  onExitSuperAdmin?: () => void;
  onLogout?: () => void;
  onSwitchToSchoolDemo?: () => void;
  onOpenMobileSidebar?: () => void;
}

export const SuperAdminTopNav: React.FC<SuperAdminTopNavProps> = ({
  currentAdmin,
  adminUser,
  isDarkMode,
  onToggleDarkMode,
  onOpenCommandPalette,
  supportTickets = [],
  systemServices = [],
  schools = [],
  transactions = [],
  onNavigateTab = (_tabId: string) => {},
  onOpenSettings,
  onExitSuperAdmin,
  onLogout = onExitSuperAdmin || (() => {}),
  onSwitchToSchoolDemo,
  onOpenMobileSidebar = () => {}
}) => {
  const activeAdmin = currentAdmin || adminUser || INITIAL_SUPER_ADMIN;
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHealthMenuOpen, setIsHealthMenuOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const healthRef = useRef<HTMLDivElement>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
      if (healthRef.current && !healthRef.current.contains(event.target as Node)) {
        setIsHealthMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const openTicketsCount = supportTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const urgentTicketsCount = supportTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;
  const allServicesOperational = systemServices.every(s => s.status === 'Operational');
  const avgUptime = systemServices.length > 0
    ? systemServices.reduce((sum, s) => sum + (s.uptimePct || 0), 0) / systemServices.length
    : 100;
  const pendingSchools = schools.filter(s => s.status === 'Pending');
  const failedPayments = transactions.filter(tx => tx.status === 'Failed');
  const degradedServices = systemServices.filter(s => s.status !== 'Operational');
  const alertCount = pendingSchools.length + openTicketsCount + failedPayments.length + degradedServices.length;

  const notifications = [
    ...pendingSchools.map(s => ({
      id: `al-${s.id}`,
      icon: Building2,
      iconClass: 'text-amber-600 dark:text-amber-400',
      title: `${s.name} awaiting approval`,
      detail: `${s.city} • ${s.planName} ${s.billingCycle} plan • ${s.studentCount} students`
    })),
    ...(openTicketsCount > 0 ? [{
      id: 'al-tickets',
      icon: LifeBuoy,
      iconClass: 'text-purple-600 dark:text-purple-400',
      title: `${openTicketsCount} open support ticket${openTicketsCount === 1 ? '' : 's'}`,
      detail: `${urgentTicketsCount > 0 ? `${urgentTicketsCount} urgent or high priority • ` : ''}resolve in the Support Desk`
    }] : []),
    ...failedPayments.map(tx => ({
      id: `al-${tx.id}`,
      icon: ShieldAlert,
      iconClass: 'text-red-600 dark:text-red-400',
      title: `Payment failed: PKR ${tx.netAmountPKR.toLocaleString()}`,
      detail: `${tx.schoolName} • ${tx.invoiceNo} • ${tx.failureReason || tx.paymentMethod}`
    })),
    ...degradedServices.map(s => ({
      id: `al-${s.name}`,
      icon: Activity,
      iconClass: 'text-amber-600 dark:text-amber-400',
      title: `${s.name} is ${s.status.toLowerCase()}`,
      detail: `${s.latencyMs}ms latency • ${s.description}`
    }))
  ];

  const navigateTo = (tabId: string) => {
    const normalized = tabId === 'system-health' ? 'status'
      : tabId === 'support' ? 'tickets'
      : tabId === 'audit-logs' ? 'audit'
      : tabId;
    onNavigateTab(normalized);
  };

  return (
    <header className="h-16 border-b border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 transition-colors">
      {/* Left: Brand + Environment Badge */}
      <div className="flex items-center gap-2 md:gap-4 min-w-0">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          title="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-teal-700 via-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-700/20 font-black text-base">
            TL
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-slate-900 dark:text-white">
                TaleemLM
              </span>
              <span className="text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border border-teal-200/60 dark:border-teal-800">
                SUPER ADMIN
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">
              SaaS Multi-Tenant Control Center • Pakistan
            </p>
          </div>
        </div>

        {/* Global Environment Indicator */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 shadow-xs shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>PRODUCTION</span>
        </div>
      </div>

      {/* Center: Global Search Bar / Command Palette Trigger */}
      <div className="flex-1 max-w-xl mx-4 hidden md:block">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-2 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 hover:bg-slate-200/70 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200/80 dark:border-slate-700/60 text-xs transition-all shadow-2xs group cursor-pointer"
        >
          <span className="flex items-center gap-2.5 truncate">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <span className="truncate">Search schools, users, subscriptions, invoices, tickets...</span>
          </span>
          <kbd className="hidden lg:inline-flex items-center gap-1 font-mono text-[10px] bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700 font-semibold shadow-2xs">
            <Command className="w-3 h-3" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-1.5 md:gap-2.5">
        {/* Mobile Search Button */}
        <button
          onClick={onOpenCommandPalette}
          className="md:hidden p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* System Health Status Popover */}
        <div className="relative" ref={healthRef}>
          <button
            onClick={() => setIsHealthMenuOpen(!isHealthMenuOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative flex items-center gap-1.5 text-xs font-semibold"
            title="System Status"
          >
            <Activity className={`w-4 h-4 ${allServicesOperational ? 'text-emerald-500' : 'text-amber-500 animate-pulse'}`} />
            <span className="hidden xl:inline text-[11px] text-slate-600 dark:text-slate-300">
              {avgUptime.toFixed(2)}%
            </span>
          </button>

          {isHealthMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3.5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Platform System Health</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  allServicesOperational
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {allServicesOperational ? 'All Green' : `${degradedServices.length} Service Alert${degradedServices.length === 1 ? '' : 's'}`}
                </span>
              </div>

              <div className="py-2 space-y-1.5 max-h-56 overflow-y-auto text-xs">
                {systemServices.slice(0, 5).map((srv, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    <span className="truncate text-slate-700 dark:text-slate-300 font-medium pr-2">{srv.name}</span>
                    <span className={`font-mono text-[10px] font-bold shrink-0 ${
                      srv.status === 'Operational' ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {srv.uptimePct}% · {srv.latencyMs}ms
                    </span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsHealthMenuOpen(false);
                  navigateTo('system-health');
                }}
                className="w-full mt-2 py-1.5 text-center text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 rounded-xl transition-colors"
              >
                Inspect All {systemServices.length} Services & Logs →
              </button>
            </div>
          )}
        </div>

        {/* Support Alert Quick Badge */}
        <button
          onClick={() => navigateTo('support')}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          title={`${openTicketsCount} Open Support Tickets`}
        >
          <LifeBuoy className="w-4 h-4 text-purple-600 dark:text-purple-400" />
          {urgentTicketsCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 px-1.5 py-0.2 bg-red-600 text-white rounded-full text-[9px] font-bold shadow-xs">
              {urgentTicketsCount}
            </span>
          )}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Super Admin Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
            {alertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 px-1 py-0.5 rounded-full bg-teal-500 text-white text-[8px] font-bold leading-none">
                {alertCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 md:w-96 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Platform Broadcasts & Alerts</span>
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-bold">
                    {alertCount} New
                  </span>
                </h4>
              </div>

              <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto text-xs space-y-1">
                {notifications.length === 0 && (
                  <div className="py-4 text-center text-slate-400 text-xs">
                    No pending alerts. All systems operational.
                  </div>
                )}
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5">
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span className={`flex items-center gap-1.5 ${n.iconClass}`}>
                        <n.icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{n.title}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {n.detail}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setIsNotificationsOpen(false);
                  navigateTo('audit');
                }}
                className="w-full mt-2 py-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"
              >
                View Audit Logs Trail →
              </button>
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

        {/* Admin Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left group cursor-pointer"
          >
            <img
              src={activeAdmin.avatar}
              alt={activeAdmin.name}
              className="w-8 h-8 rounded-xl object-cover border border-teal-500/30 ring-2 ring-teal-500/10"
            />
            <div className="hidden lg:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1">
                <span>{activeAdmin.name}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
              </div>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-semibold leading-none">
                {activeAdmin.role}
              </p>
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-2 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl mb-1.5">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{activeAdmin.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{activeAdmin.email}</p>
                <div className="mt-2 flex items-center justify-between text-[10px]">
                  <span className="font-semibold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-md">
                    {activeAdmin.department} Dept
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium">2FA Active</span>
                </div>
              </div>

              <div className="space-y-0.5 text-xs">
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigateTo('settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>Platform Settings</span>
                </button>

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    navigateTo('audit');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-left transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-400" />
                  <span>Security & Audit Trail</span>
                </button>

                {onSwitchToSchoolDemo && (
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      onSwitchToSchoolDemo();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/40 font-semibold text-left transition-colors"
                  >
                    <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span>Open School Portal (Main Domain)</span>
                  </button>
                )}

                <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 font-semibold text-left transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout Super Admin</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
