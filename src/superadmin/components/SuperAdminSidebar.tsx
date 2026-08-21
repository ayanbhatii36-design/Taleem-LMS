import React from 'react';
import { 
  LayoutDashboard, 
  Building2, 
  CreditCard, 
  Receipt, 
  Users, 
  LifeBuoy, 
  TrendingUp, 
  Bell, 
  Activity, 
  ShieldCheck, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  Zap, 
  FileText, 
  FolderLock, 
  Plus, 
  Layers, 
  HelpCircle,
  Clock,
  AlertTriangle,
  Flame,
  Globe,
  X
} from 'lucide-react';
import { SchoolTenant, SupportTicket, PaymentTransaction, SystemServiceStatus } from '../types';

export type SuperAdminNavTab = 
  | 'overview'
  | 'schools'
  | 'subscriptions'
  | 'plans'
  | 'billing'
  | 'users'
  | 'support'
  | 'tickets'
  | 'analytics'
  | 'announcements'
  | 'system-health'
  | 'status'
  | 'audit-logs'
  | 'audit'
  | 'team'
  | 'settings';

interface SuperAdminSidebarProps {
  activeTab?: string;
  activeSection?: string;
  onSelectTab?: (tab: any) => void;
  onSelectSection?: (section: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse: () => void;
  schools?: SchoolTenant[];
  supportTickets?: SupportTicket[];
  transactions?: PaymentTransaction[];
  systemServices?: SystemServiceStatus[];
  pendingSchoolsCount?: number;
  openTicketsCount?: number;
  failedPaymentsCount?: number;
  onOpenAddSchoolModal?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const SuperAdminSidebar: React.FC<SuperAdminSidebarProps> = ({
  activeTab,
  activeSection,
  onSelectTab,
  onSelectSection,
  isCollapsed = false,
  onToggleCollapse,
  schools = [],
  supportTickets = [],
  transactions = [],
  systemServices = [],
  pendingSchoolsCount: propPendingSchools,
  openTicketsCount: propOpenTickets,
  failedPaymentsCount: propFailedPayments,
  onOpenAddSchoolModal = () => {},
  isMobileOpen = false,
  onMobileClose = () => {}
}) => {
  const currentTab = activeSection || activeTab || 'overview';
  const pendingSchoolsCount = propPendingSchools !== undefined 
    ? propPendingSchools 
    : schools.filter(s => s.status === 'Pending').length;

  const trialSchoolsCount = schools.filter(s => s.status === 'Trial').length;

  const openTicketsCount = propOpenTickets !== undefined 
    ? propOpenTickets 
    : supportTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;

  const urgentTicketsCount = supportTickets.filter(t => t.priority === 'Urgent' || t.priority === 'High').length;

  const failedTxCount = propFailedPayments !== undefined 
    ? propFailedPayments 
    : transactions.filter(tx => tx.status === 'Failed').length;

  // Data-driven metrics (no hard-coded stats)
  const activeSchools = schools.filter(s => s.status !== 'Suspended' && s.status !== 'Cancelled' && s.status !== 'Expired');
  const monthlyMRR = activeSchools.reduce((sum, s) => sum + (s.monthlyFeePKR || 0), 0);
  const avgUptime = systemServices.length > 0
    ? systemServices.reduce((sum, s) => sum + (s.uptimePct || 0), 0) / systemServices.length
    : 100;
  const now = new Date();
  const recentSchools = schools.filter(s => {
    const d = new Date(s.createdDate);
    return !isNaN(d.getTime()) && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const growthPct = schools.length > 0 ? Math.round((recentSchools.length / schools.length) * 100) : 0;

  const handleSelect = (tab: string) => {
    if (onSelectSection) onSelectSection(tab);
    else if (onSelectTab) onSelectTab(tab);
    onMobileClose();
  };

  const navSections = [
    {
      group: 'Core Operations',
      items: [
        {
          id: 'overview' as SuperAdminNavTab,
          label: 'Dashboard Overview',
          icon: LayoutDashboard,
          badge: null
        },
        {
          id: 'schools' as SuperAdminNavTab,
          label: 'Schools & Campuses',
          icon: Building2,
          badge: pendingSchoolsCount > 0 ? `${pendingSchoolsCount} new` : `${schools.length}`,
          badgeColor: pendingSchoolsCount > 0 ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
        },
        {
          id: 'subscriptions' as SuperAdminNavTab,
          label: 'Subscription Plans',
          icon: Layers,
          badge: `${trialSchoolsCount} trials`,
          badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
        },
        {
          id: 'billing' as SuperAdminNavTab,
          label: 'Billing & Invoicing',
          icon: Receipt,
          badge: failedTxCount > 0 ? `${failedTxCount} failed` : null,
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
        },
        {
          id: 'users' as SuperAdminNavTab,
          label: 'Global User Directory',
          icon: Users,
          badge: null
        }
      ]
    },
    {
      group: 'Customer & Growth',
      items: [
        {
          id: 'support' as SuperAdminNavTab,
          label: 'Support Desk Tickets',
          icon: LifeBuoy,
          badge: openTicketsCount > 0 ? `${openTicketsCount}` : null,
          badgeColor: urgentTicketsCount > 0 ? 'bg-red-500 text-white font-bold animate-pulse' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
        },
        {
          id: 'analytics' as SuperAdminNavTab,
          label: 'Platform Growth & MRR',
          icon: TrendingUp,
          badge: `+${growthPct}%`,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        }
      ]
    },
    {
      group: 'Governance & System',
      items: [
        {
          id: 'system-health' as SuperAdminNavTab,
          label: 'Infrastructure Health',
          icon: Activity,
          badge: `${avgUptime.toFixed(2)}%`,
          badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
        },
        {
          id: 'audit-logs' as SuperAdminNavTab,
          label: 'Security & Audit Trail',
          icon: ShieldCheck,
          badge: null
        },
        {
          id: 'settings' as SuperAdminNavTab,
          label: 'Platform Settings',
          icon: Settings,
          badge: null
        }
      ]
    }
  ];

  return (
    <aside 
      className={`fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-slate-900 border-r border-slate-200/80 dark:border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 w-64 ${
        isCollapsed ? 'lg:w-20' : 'lg:w-72'
      } ${isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0 lg:shadow-none`}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onMobileClose}
        className="lg:hidden absolute top-3 right-3 p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors z-10 cursor-pointer"
        title="Close navigation"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Top Action / New School CTA */}
      <div className="p-3.5 border-b border-slate-100 dark:border-slate-800/80">
        {isCollapsed ? (
          <button
            onClick={onOpenAddSchoolModal}
            className="w-full h-11 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white flex items-center justify-center shadow-md shadow-teal-700/20 transition-all cursor-pointer"
            title="Create New School Tenant"
          >
            <Plus className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={onOpenAddSchoolModal}
            className="w-full py-2.5 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-between group cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
              <span>Onboard New School</span>
            </span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono">
              +School
            </span>
          </button>
        )}
      </div>

      {/* Navigation Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-5 scrollbar-thin">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-1">
                {section.group}
              </div>
            )}

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isTabMatch = 
                  currentTab === item.id ||
                  (item.id === 'subscriptions' && currentTab === 'plans') ||
                  (item.id === 'plans' && currentTab === 'subscriptions') ||
                  (item.id === 'support' && currentTab === 'tickets') ||
                  (item.id === 'tickets' && currentTab === 'support') ||
                  (item.id === 'system-health' && currentTab === 'status') ||
                  (item.id === 'status' && currentTab === 'system-health') ||
                  (item.id === 'audit-logs' && currentTab === 'audit') ||
                  (item.id === 'audit' && currentTab === 'audit-logs');
                const isActive = isTabMatch;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      // Normalize to standard section name if needed
                      let targetId = item.id;
                      if (item.id === 'subscriptions') targetId = 'plans';
                      if (item.id === 'support') targetId = 'tickets';
                      if (item.id === 'system-health') targetId = 'status';
                      if (item.id === 'audit-logs') targetId = 'audit';
                      handleSelect(targetId);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-xs font-semibold transition-all group relative cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 shadow-2xs font-bold border border-teal-200/60 dark:border-teal-800/80'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    } ${isCollapsed ? 'justify-center px-0' : 'justify-between'}`}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={`p-1.5 rounded-xl transition-colors ${
                        isActive
                          ? 'bg-teal-600 text-white shadow-xs'
                          : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </span>
                      {!isCollapsed && (
                        <span className="truncate">{item.label}</span>
                      )}
                    </div>

                    {!isCollapsed && item.badge && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${item.badgeColor}`}>
                        {item.badge}
                      </span>
                    )}

                    {/* Active Indicator Bar */}
                    {isActive && (
                      <span className="absolute left-0 top-2 bottom-2 w-1 bg-teal-600 rounded-r-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Footer: Platform Meta & Collapse Toggle */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
        {!isCollapsed && (
          <div className="p-2.5 rounded-xl bg-teal-950/5 dark:bg-teal-950/30 border border-teal-200/40 dark:border-teal-900/40 mb-2.5 text-[11px]">
            <div className="flex items-center justify-between font-bold text-teal-900 dark:text-teal-200">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Pakistani Multi-Tenant</span>
              </span>
              <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300">PKR Mode</span>
            </div>
<p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
            Active MRR: <span className="font-bold text-slate-900 dark:text-white">PKR {(monthlyMRR / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}M</span> • {schools.length} Campus{schools.length === 1 ? '' : 'es'}
          </p>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs font-semibold cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
