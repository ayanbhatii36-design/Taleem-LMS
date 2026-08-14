import React from 'react';
import { 
  Building2, 
  Users, 
  CreditCard, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  AlertCircle, 
  Plus, 
  LifeBuoy, 
  Activity, 
  ShieldCheck, 
  Receipt, 
  Sparkles, 
  Clock, 
  Calendar, 
  MapPin, 
  ExternalLink,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  Download,
  Bell
} from 'lucide-react';
import { 
  SchoolTenant, 
  PaymentTransaction, 
  SupportTicket, 
  AuditLog, 
  SystemServiceStatus, 
  GlobalAnnouncement,
  SubscriptionPlan 
} from '../../types/superAdmin';

interface DashboardOverviewProps {
  schools?: SchoolTenant[];
  transactions?: PaymentTransaction[];
  tickets?: SupportTicket[];
  auditLogs?: AuditLog[];
  systemServices?: SystemServiceStatus[];
  announcements?: GlobalAnnouncement[];
  plans?: SubscriptionPlan[];
  onNavigateTab?: (tabId: string) => void;
  onNavigate?: (tabId: string) => void;
  onSelectSchool?: (school: SchoolTenant) => void;
  onSelectTicket?: (ticket: SupportTicket) => void;
  onOpenAddSchoolModal?: () => void;
  onOpenBroadcastModal?: () => void;
  onImpersonateSchool?: (school: SchoolTenant) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  schools = [],
  transactions = [],
  tickets = [],
  auditLogs = [],
  systemServices = [],
  announcements = [],
  plans = [],
  onNavigateTab,
  onNavigate,
  onSelectSchool = (_school: SchoolTenant) => {},
  onSelectTicket = (_ticket: SupportTicket) => {},
  onOpenAddSchoolModal = () => {},
  onOpenBroadcastModal = () => {},
  onImpersonateSchool = (_school: SchoolTenant) => {}
}) => {
  const navigateTo = (tabId: string) => {
    if (onNavigate) onNavigate(tabId);
    else if (onNavigateTab) onNavigateTab(tabId);
  };
  // Key Metrics Calculations
  const totalSchools = schools.length;
  const activeSchools = schools.filter(s => s.status === 'Active').length;
  const trialSchools = schools.filter(s => s.status === 'Trial').length;
  const pendingSchools = schools.filter(s => s.status === 'Pending').length;
  const suspendedSchools = schools.filter(s => s.status === 'Suspended').length;

  const totalStudents = schools.reduce((acc, s) => acc + s.studentCount, 0);
  const totalTeachers = schools.reduce((acc, s) => acc + s.teacherCount, 0);
  const totalParents = schools.reduce((acc, s) => acc + s.parentCount, 0);
  const totalUsersCount = totalStudents + totalTeachers + totalParents;

  // Monthly Recurring Revenue in PKR
  const monthlyRecurringRevenuePKR = schools
    .filter(s => s.status === 'Active')
    .reduce((acc, s) => acc + s.monthlyFeePKR, 0);

  const annualRunRatePKR = monthlyRecurringRevenuePKR * 12;

  const pendingPaymentsPKR = transactions
    .filter(tx => tx.status === 'Pending' || tx.status === 'Failed')
    .reduce((acc, tx) => acc + tx.netAmountPKR, 0);

  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const urgentTickets = tickets.filter(t => (t.priority === 'Urgent' || t.priority === 'High') && t.status !== 'Resolved');

  // Province Breakdown
  const provinceStats = [
    { province: 'Punjab', count: schools.filter(s => s.province === 'Punjab').length, mrr: 4500000, color: 'bg-emerald-500' },
    { province: 'Sindh', count: schools.filter(s => s.province === 'Sindh').length, mrr: 1950000, color: 'bg-teal-500' },
    { province: 'ICT (Islamabad)', count: schools.filter(s => s.province === 'Islamabad Capital Territory').length, mrr: 1200000, color: 'bg-blue-500' },
    { province: 'Khyber Pakhtunkhwa', count: schools.filter(s => s.province === 'Khyber Pakhtunkhwa').length, mrr: 950000, color: 'bg-indigo-500' },
    { province: 'Balochistan', count: schools.filter(s => s.province === 'Balochistan').length, mrr: 185000, color: 'bg-amber-500' }
  ];

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Top Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Control Center
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-100 dark:bg-teal-950/80 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Pakistan Region
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time multi-tenant health, recurring subscription revenues, campus allocations, and audit stream.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={onOpenBroadcastModal}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            <span>Broadcast Alert</span>
          </button>

          <button
            onClick={() => onNavigateTab('revenue')}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export Financials</span>
          </button>

          <button
            onClick={onOpenAddSchoolModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard School</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (4 High Impact Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Total Schools */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-teal-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Educational Campuses
            </span>
            <span className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalSchools.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +2 this month
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">{activeSchools}</strong> Active
            </span>
            <span>•</span>
            <span>
              <strong className="text-blue-600 dark:text-blue-400 font-bold">{trialSchools}</strong> Trial
            </span>
            <span>•</span>
            <span>
              <strong className="text-amber-600 dark:text-amber-400 font-bold">{pendingSchools}</strong> Pending
            </span>
          </div>
        </div>

        {/* Card 2: Total Platform Users */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Platform Community
            </span>
            <span className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {totalUsersCount.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +18.4% YoY
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">{totalStudents.toLocaleString()}</strong> Students
            </span>
            <span>•</span>
            <span>
              <strong className="text-slate-900 dark:text-white font-bold">{totalTeachers.toLocaleString()}</strong> Staff
            </span>
          </div>
        </div>

        {/* Card 3: Monthly Recurring Revenue (PKR) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Monthly Recurring (MRR)
            </span>
            <span className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-mono">
              PKR {(monthlyRecurringRevenuePKR / 1000000).toFixed(2)}M
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
              <ArrowUpRight className="w-3.5 h-3.5" />
              +14.2%
            </span>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>
              ARR: <strong className="text-slate-900 dark:text-white font-bold font-mono">PKR {(annualRunRatePKR / 1000000).toFixed(1)}M</strong>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">97.2% Collected</span>
          </div>
        </div>

        {/* Card 4: Support & SLA */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-purple-500/40 transition-all group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Support Health & SLA
            </span>
            <span className="p-2.5 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
              <LifeBuoy className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              {openTicketsCount} Open
            </span>
            {urgentTickets.length > 0 ? (
              <span className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {urgentTickets.length} Urgent
              </span>
            ) : (
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                All normal
              </span>
            )}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            <span>Avg Reply: <strong className="text-slate-900 dark:text-white font-bold">14 mins</strong></span>
            <span>•</span>
            <span className="text-purple-600 dark:text-purple-400 font-semibold">CSAT 4.9/5</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left 2 Cols (Recent Schools + Revenue Streams) & Right 1 Col (System Status & Audit Stream) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Schools Table Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>Institutional Tenants Directory</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  High-profile school systems and colleges onboarded to TaleemLM
                </p>
              </div>
              <button
                onClick={() => navigateTo('schools')}
                className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:text-teal-900 dark:hover:text-teal-100 flex items-center gap-1 cursor-pointer"
              >
                <span>View All ({schools.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* School Items */}
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {schools.slice(0, 5).map((school) => (
                <div 
                  key={school.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 p-2 rounded-2xl transition-colors group"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img
                      src={school.logo}
                      alt={school.name}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 group-hover:scale-105 transition-transform"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => onSelectSchool(school)}
                          className="font-bold text-xs text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 truncate text-left cursor-pointer"
                        >
                          {school.name}
                        </button>
                        <span className="font-mono text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {school.code}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {school.city}, {school.province}
                        </span>
                        <span>•</span>
                        <span>{school.studentCount} Students</span>
                        <span>•</span>
                        <span className="font-semibold text-teal-700 dark:text-teal-400">{school.planName}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      school.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : school.status === 'Trial'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        : school.status === 'Pending'
                        ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {school.status}
                    </span>

                    {/* Quick Impersonate Button */}
                    <button
                      onClick={() => onImpersonateSchool(school)}
                      className="p-1.5 rounded-xl bg-slate-100 hover:bg-teal-50 dark:bg-slate-800 dark:hover:bg-teal-950 text-slate-500 hover:text-teal-700 dark:text-slate-300 dark:hover:text-teal-300 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                      title="Impersonate School Principal"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline text-[10px]">Login As Principal</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pakistan Provincial Distribution Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Pakistan Regional Distribution & Coverage</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Institutes distribution and monthly fee collection by territory
                </p>
              </div>
              <span className="text-[11px] font-bold text-slate-500">
                5 Provinces Active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
              {provinceStats.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {item.province}
                    </span>
                    <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-lg font-black text-slate-900 dark:text-white">
                      {item.count} <span className="text-[11px] font-normal text-slate-400">Schools</span>
                    </span>
                    <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400">
                      PKR {(item.mrr / 1000000).toFixed(2)}M
                    </span>
                  </div>
                  <div className="mt-2 w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div 
                      className="h-full bg-teal-600 rounded-full" 
                      style={{ width: `${(item.count / totalSchools) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Live Infrastructure & Recent Audit Logs */}
        <div className="space-y-6">
          {/* Live Infrastructure Card */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Live Platform Health</h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                99.98% SLA
              </span>
            </div>

            <div className="py-2 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {systemServices.slice(0, 4).map((service, idx) => (
                <div key={idx} className="py-2.5 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {service.name}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {service.category} • Checked {service.lastChecked}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      {service.latencyMs}ms
                    </span>
                    <div className="text-[9px] text-slate-400 font-mono">
                      {service.uptimePct}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => navigateTo('status')}
              className="w-full mt-2 py-2 text-center text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/50 hover:bg-teal-100 dark:hover:bg-teal-900 rounded-xl transition-colors cursor-pointer"
            >
              Inspect All Services & Latencies →
            </button>
          </div>

          {/* Real-time Audit Trail Stream */}
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Audit Trail Stream</h3>
              </div>
              <button
                onClick={() => navigateTo('audit')}
                className="text-[11px] font-bold text-teal-700 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Full Trail
              </button>
            </div>

            <div className="py-2 space-y-3 text-xs">
              {auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between font-bold">
                    <span className="text-slate-900 dark:text-white truncate pr-2">
                      {log.action}
                    </span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      log.severity === 'danger'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                    }`}>
                      {log.result}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                    {log.details}
                  </p>
                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{log.adminName}</span>
                    <span>{log.timestamp.split(' ')[1]}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
