import React, { useState } from 'react';
import { 
  Building2, 
  ArrowLeft, 
  ExternalLink, 
  Layers, 
  ShieldAlert, 
  CreditCard, 
  Users, 
  BookOpen, 
  LifeBuoy, 
  Activity, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  CheckCircle2, 
  Clock, 
  HardDrive, 
  Edit3, 
  Trash2, 
  Download, 
  Plus, 
  AlertCircle,
  FileText,
  Key,
  ShieldCheck,
  Send
} from 'lucide-react';
import { 
  SchoolTenant, 
  PaymentTransaction, 
  SupportTicket, 
  AuditLog, 
  GlobalUser 
} from '../types';

interface SchoolDetailsViewProps {
  school: SchoolTenant;
  transactions: PaymentTransaction[];
  tickets: SupportTicket[];
  users: GlobalUser[];
  auditLogs: AuditLog[];
  onBack: () => void;
  onImpersonateSchool: (school: SchoolTenant) => void;
  onOpenSubscriptionModal: (school: SchoolTenant) => void;
  onToggleSuspendSchool: (schoolId: string, currentStatus: any) => void;
  onRequestDeleteSchool: (school: SchoolTenant) => void;
}

type DetailTab = 'overview' | 'subscription' | 'billing' | 'users' | 'academics' | 'tickets' | 'audit';

export const SchoolDetailsView: React.FC<SchoolDetailsViewProps> = ({
  school,
  transactions,
  tickets,
  users,
  auditLogs,
  onBack,
  onImpersonateSchool,
  onOpenSubscriptionModal,
  onToggleSuspendSchool,
  onRequestDeleteSchool
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>('overview');

  const schoolTransactions = transactions.filter(t => t.schoolId === school.id);
  const schoolTickets = tickets.filter(t => t.schoolId === school.id);
  const schoolUsers = users.filter(u => u.schoolId === school.id);
  const schoolAuditLogs = auditLogs.filter(a => a.schoolName === school.name || a.target.includes(school.name));

  const studentUsagePct = Math.round((school.studentCount / school.maxStudents) * 100);
  const teacherUsagePct = Math.round((school.teacherCount / school.maxTeachers) * 100);
  const storageUsagePct = Math.round((school.storageUsedGB / school.storageLimitGB) * 100);
  const courseUsagePct = Math.round((school.coursesCount / school.maxCourses) * 100);

  const annualDiscountPct = school.monthlyFeePKR > 0
    ? Math.round((1 - school.annualFeePKR / (school.monthlyFeePKR * 12)) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Back Button & Top Action Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Schools</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onImpersonateSchool(school)}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Login As Principal</span>
          </button>

          <button
            onClick={() => onOpenSubscriptionModal(school)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4 text-teal-600" />
            <span>Manage Plan</span>
          </button>

          <button
            onClick={() => onToggleSuspendSchool(school.id, school.status)}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-400 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{school.status === 'Suspended' ? 'Reactivate' : 'Suspend'}</span>
          </button>

          <button
            onClick={() => onRequestDeleteSchool(school)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-red-200 dark:border-red-900/40 hover:bg-red-50 dark:hover:bg-red-950/40 text-red-600 dark:text-red-400 transition-colors cursor-pointer"
            title="Delete Tenant"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* School Header Banner Card */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <img
              src={school.logo}
              alt={school.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm shrink-0"
            />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-white">
                  {school.name}
                </h1>
                <span className="font-mono text-xs font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg text-slate-700 dark:text-slate-300">
                  {school.code}
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  school.status === 'Active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                    : school.status === 'Trial'
                    ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                    : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                }`}>
                  {school.status}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-2 flex-wrap font-medium">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {school.address}, {school.city}, {school.province}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {school.email}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {school.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-right w-full md:w-auto md:min-w-0">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Current Subscription
            </div>
            <div className="text-base font-black text-teal-800 dark:text-teal-300 mt-0.5">
              {school.planName} Plan
            </div>
            <div className="text-xs font-mono font-bold text-slate-900 dark:text-white mt-1">
              PKR {school.monthlyFeePKR.toLocaleString()} <span className="font-normal text-[10px] text-slate-400">/month</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Next billing: {school.nextBillingDate}
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto border-t border-slate-100 dark:border-slate-800 mt-6 pt-4 text-xs font-bold scrollbar-none">
          {[
            { id: 'overview' as DetailTab, label: 'Overview & Usage', icon: Building2 },
            { id: 'subscription' as DetailTab, label: 'Subscription & Tier', icon: Layers },
            { id: 'billing' as DetailTab, label: `Invoices & Billing (${schoolTransactions.length})`, icon: CreditCard },
            { id: 'users' as DetailTab, label: `Users & Staff (${schoolUsers.length})`, icon: Users },
            { id: 'academics' as DetailTab, label: 'Academic & LMS Config', icon: BookOpen },
            { id: 'tickets' as DetailTab, label: `Support Tickets (${schoolTickets.length})`, icon: LifeBuoy },
            { id: 'audit' as DetailTab, label: 'Audit Trail', icon: Activity }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 border border-teal-200/60 dark:border-teal-800'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Overview & Usage */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Capacity Usage Progress Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Students Capacity */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Enrolled Students</span>
                <span className="font-mono font-bold text-teal-600">{studentUsagePct}%</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {school.studentCount} <span className="text-xs font-normal text-slate-400">/ {school.maxStudents} limit</span>
              </div>
              <div className="mt-2.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${studentUsagePct > 90 ? 'bg-red-500' : 'bg-teal-600'}`}
                  style={{ width: `${Math.min(studentUsagePct, 100)}%` }}
                />
              </div>
            </div>

            {/* Teachers Capacity */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Faculty & Teachers</span>
                <span className="font-mono font-bold text-teal-600">{teacherUsagePct}%</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {school.teacherCount} <span className="text-xs font-normal text-slate-400">/ {school.maxTeachers} limit</span>
              </div>
              <div className="mt-2.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-blue-600"
                  style={{ width: `${Math.min(teacherUsagePct, 100)}%` }}
                />
              </div>
            </div>

            {/* Storage Usage */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Cloud Storage</span>
                <span className="font-mono font-bold text-teal-600">{storageUsagePct}%</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white font-mono">
                {school.storageUsedGB.toFixed(1)} GB <span className="text-xs font-normal text-slate-400">/ {school.storageLimitGB} GB</span>
              </div>
              <div className="mt-2.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-purple-600"
                  style={{ width: `${Math.min(storageUsagePct, 100)}%` }}
                />
              </div>
            </div>

            {/* Active LMS Courses */}
            <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                <span className="font-bold text-slate-700 dark:text-slate-300">Active Courses</span>
                <span className="font-mono font-bold text-teal-600">{courseUsagePct}%</span>
              </div>
              <div className="text-xl font-black text-slate-900 dark:text-white">
                {school.coursesCount} <span className="text-xs font-normal text-slate-400">/ {school.maxCourses} limit</span>
              </div>
              <div className="mt-2.5 w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full bg-emerald-600"
                  style={{ width: `${Math.min(courseUsagePct, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Details 2-Column Split */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Primary Contacts & Principal */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-600" />
                <span>Primary Leadership & Admin Contact</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Principal / Head of Institute:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{school.principalName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Official Principal Email:</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300 font-semibold">{school.principalEmail}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Direct Phone / WhatsApp:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-semibold">{school.principalPhone}</span>
                </div>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Institute Website:</span>
                  <a href={school.website || '#'} target="_blank" rel="noreferrer" className="text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1 hover:underline">
                    <span>{school.website || 'Not configured'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">Account Onboarded Date:</span>
                  <span className="font-medium text-slate-900 dark:text-white">{school.createdDate}</span>
                </div>
                <div className="flex items-center justify-between py-1.5">
                  <span className="text-slate-500">Last System Activity:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">{school.lastActive}</span>
                </div>
              </div>
            </div>

            {/* Academic & Curriculum System */}
            <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal-600" />
                <span>Academic & Grading Structure</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Curriculum System:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{school.academicSystem}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Grading & Transcript Standard:</span>
                  <span className="font-semibold text-teal-700 dark:text-teal-300">{school.gradingSystem}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Operational Timezone:</span>
                  <span className="font-mono text-slate-900 dark:text-white">{school.timezone}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Default Currency:</span>
                  <span className="font-bold text-emerald-600">{school.currency} (Pakistani Rupee)</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/40 dark:border-teal-900/40 text-xs text-teal-900 dark:text-teal-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold">Pakistani Examination Sync Active</div>
                  <div className="text-[11px] opacity-90 mt-0.5">
                    Automated report card rendering configured for Board roll numbers, Cambridge statement of entries, and WhatsApp notification delivery.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Subscription & Tier */}
      {activeTab === 'subscription' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Subscription Tier & Entitlements
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Current package limits, feature entitlements, billing cycle, and upgrade management
              </p>
            </div>
            <button
              onClick={() => onOpenSubscriptionModal(school)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Modify Plan / Upgrade</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Plan Name</div>
              <div className="text-xl font-black text-teal-800 dark:text-teal-300 mt-1">{school.planName}</div>
              <div className="text-xs text-slate-500 mt-1">
                Billing: {school.billingCycle === 'annual' ? (annualDiscountPct > 0 ? `Annual (${annualDiscountPct}% Discount)` : 'Annual') : 'Monthly'}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Recurring Price</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1 font-mono">
                PKR {school.monthlyFeePKR.toLocaleString()} <span className="text-xs font-normal text-slate-400">/mo</span>
              </div>
              <div className="text-xs text-emerald-600 font-mono mt-1">PKR {school.annualFeePKR.toLocaleString()} /yr</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700">
              <div className="text-[10px] font-bold text-slate-400 uppercase">Next Invoicing Date</div>
              <div className="text-xl font-black text-slate-900 dark:text-white mt-1">{school.nextBillingDate}</div>
              <div className="text-xs text-emerald-600 mt-1">Auto-Invoicing Enabled</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Invoices & Billing */}
      {activeTab === 'billing' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Payment Transactions & Invoices
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Financial records and bank settlement history for {school.name}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                <tr>
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Amount (PKR)</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Gateway Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schoolTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No invoices recorded for this school yet.
                    </td>
                  </tr>
                ) : (
                  schoolTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-teal-600 dark:text-teal-400">
                        {tx.invoiceNo}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {tx.date}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                        PKR {tx.netAmountPKR.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {tx.paymentMethod}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : tx.status === 'Failed'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                        {tx.gatewayRef || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Users & Staff */}
      {activeTab === 'users' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Users & Staff
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Registered accounts for {school.name}
            </p>
          </div>
          {schoolUsers.length === 0 ? (
            <p className="py-8 text-center text-slate-400 text-xs">
              No users registered for this campus yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last Active</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{u.role}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-teal-700 dark:text-teal-300">{u.email}</td>
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{u.phone}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : u.status === 'Suspended'
                            ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{u.lastActive}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Academic & LMS Config */}
      {activeTab === 'academics' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Academic & LMS Configuration
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Academic structure, classes, sections, and LMS layout for {school.name}
            </p>
          </div>
          <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-center">
            <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
              Academic structure will appear here once connected.
            </p>
          </div>
        </div>
      )}

      {/* Tab 6: Support Tickets */}
      {activeTab === 'tickets' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            Campus Support Tickets
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {schoolTickets.length === 0 ? (
              <p className="py-8 text-center text-slate-400">No support tickets submitted by this campus.</p>
            ) : (
              schoolTickets.map((tkt) => (
                <div key={tkt.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="font-mono text-purple-600">{tkt.ticketNumber}</span>
                      <span>{tkt.subject}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Category: {tkt.category} • Agent: {tkt.assignedAgent.name} • Created: {tkt.createdDate}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                    {tkt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 7: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Audit Trail
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Security and administration events for {school.name}
            </p>
          </div>
          {schoolAuditLogs.length === 0 ? (
            <p className="py-8 text-center text-slate-400 text-xs">
              No audit events recorded for this campus yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Severity</th>
                    <th className="py-3 px-4">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {schoolAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.timestamp}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{log.actor}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{log.action}</td>
                      <td className="py-3 px-4 text-slate-500">{log.category}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.severity === 'danger' || log.severity === 'critical'
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : log.severity === 'warning'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : log.severity === 'success'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-xs">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
