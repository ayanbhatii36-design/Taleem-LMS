import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Building2, 
  Users, 
  CreditCard, 
  LifeBuoy, 
  FileText, 
  Sparkles, 
  ArrowRight, 
  Zap, 
  ShieldCheck, 
  Activity, 
  Bell, 
  Settings, 
  X,
  Plus
} from 'lucide-react';
import { SchoolTenant, PaymentTransaction, SupportTicket, GlobalUser } from '../../types/superAdmin';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  schools: SchoolTenant[];
  users: GlobalUser[];
  transactions: PaymentTransaction[];
  tickets: SupportTicket[];
  onNavigateTab: (tabId: string) => void;
  onSelectSchool: (school: SchoolTenant) => void;
  onSelectTicket: (ticket: SupportTicket) => void;
  onOpenAddSchool: () => void;
  onOpenAddAnnouncement: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  schools,
  users,
  transactions,
  tickets,
  onNavigateTab,
  onSelectSchool,
  onSelectTicket,
  onOpenAddSchool,
  onOpenAddAnnouncement
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return {
        schools: schools.slice(0, 3),
        users: users.slice(0, 3),
        tickets: tickets.slice(0, 2),
        transactions: transactions.slice(0, 2),
        quickActions: [
          { id: 'act-add-school', label: 'Create / Add New School Tenant', icon: Plus, action: onOpenAddSchool },
          { id: 'act-rev', label: 'View SaaS Revenue & MRR Analytics', icon: CreditCard, action: () => onNavigateTab('revenue') },
          { id: 'act-health', label: 'Inspect Live System Services & Health', icon: Activity, action: () => onNavigateTab('system-health') },
          { id: 'act-audit', label: 'Review Security & Audit Trail', icon: ShieldCheck, action: () => onNavigateTab('audit-logs') },
          { id: 'act-anc', label: 'Broadcast Global System Announcement', icon: Bell, action: onOpenAddAnnouncement }
        ]
      };
    }

    const matchedSchools = schools.filter(
      s => s.name.toLowerCase().includes(q) ||
           s.code.toLowerCase().includes(q) ||
           s.city.toLowerCase().includes(q) ||
           s.principalName.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedUsers = users.filter(
      u => u.name.toLowerCase().includes(q) ||
           u.email.toLowerCase().includes(q) ||
           u.phone.includes(q) ||
           u.schoolName.toLowerCase().includes(q) ||
           u.role.toLowerCase().includes(q)
    ).slice(0, 4);

    const matchedTickets = tickets.filter(
      t => t.ticketNumber.toLowerCase().includes(q) ||
           t.subject.toLowerCase().includes(q) ||
           t.schoolName.toLowerCase().includes(q)
    ).slice(0, 3);

    const matchedTransactions = transactions.filter(
      tx => tx.transactionRef.toLowerCase().includes(q) ||
            tx.invoiceNo.toLowerCase().includes(q) ||
            tx.schoolName.toLowerCase().includes(q)
    ).slice(0, 3);

    return {
      schools: matchedSchools,
      users: matchedUsers,
      tickets: matchedTickets,
      transactions: matchedTransactions,
      quickActions: [
        { id: 'act-add-school', label: 'Create / Add New School', icon: Plus, action: onOpenAddSchool },
        { id: 'act-schools', label: 'Go to All Schools Directory', icon: Building2, action: () => onNavigateTab('schools') },
        { id: 'act-rev', label: 'View Revenue & Payment Reports', icon: CreditCard, action: () => onNavigateTab('revenue') },
        { id: 'act-settings', label: 'Platform Settings & Gateways', icon: Settings, action: () => onNavigateTab('settings') }
      ].filter(a => a.label.toLowerCase().includes(q))
    };
  }, [query, schools, users, tickets, transactions, onOpenAddSchool, onNavigateTab, onOpenAddAnnouncement]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 p-4">
      <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Bar */}
        <div className="flex items-center px-5 py-4 border-b border-slate-100 dark:border-slate-800 gap-3">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search schools, users, invoices, tickets, or commands... (Ctrl+K)"
            className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
            >
              Clear
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results Body */}
        <div className="max-h-[65vh] overflow-y-auto p-4 space-y-4 text-xs">
          {/* Quick Actions */}
          {filteredResults.quickActions.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Quick Commands
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredResults.quickActions.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <button
                      key={qa.id}
                      onClick={() => {
                        qa.action();
                        onClose();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-teal-50 dark:hover:bg-teal-950/40 text-slate-700 dark:text-slate-200 hover:text-teal-900 dark:hover:text-teal-200 transition-colors text-left font-medium"
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="p-1.5 rounded-lg bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300">
                          <Icon className="w-4 h-4" />
                        </span>
                        <span>{qa.label}</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* School Tenants */}
          {filteredResults.schools.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-teal-600" />
                School Tenants & Campuses ({filteredResults.schools.length})
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredResults.schools.map((school) => (
                  <button
                    key={school.id}
                    onClick={() => {
                      onSelectSchool(school);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={school.logo}
                        alt={school.name}
                        className="w-8 h-8 rounded-lg object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {school.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {school.code} • {school.city}, {school.province} • {school.studentCount} Students • Plan: {school.planName}
                        </div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      school.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : school.status === 'Trial'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                    }`}>
                      {school.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Global Users */}
          {filteredResults.users.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" />
                Global Platform Users ({filteredResults.users.length})
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredResults.users.map((usr) => (
                  <button
                    key={usr.id}
                    onClick={() => {
                      onNavigateTab('users');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <img
                        src={usr.avatar}
                        alt={usr.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0"
                      />
                      <div className="truncate">
                        <div className="font-bold text-slate-900 dark:text-white truncate">
                          {usr.name} <span className="font-normal text-slate-400">({usr.role})</span>
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {usr.email} • {usr.phone} • {usr.schoolName}
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                      {usr.lastActive}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Support Tickets */}
          {filteredResults.tickets.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <LifeBuoy className="w-3.5 h-3.5 text-purple-600" />
                Support Tickets ({filteredResults.tickets.length})
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredResults.tickets.map((tkt) => (
                  <button
                    key={tkt.id}
                    onClick={() => {
                      onSelectTicket(tkt);
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        <span className="font-mono text-purple-600 dark:text-purple-400">{tkt.ticketNumber}</span>: {tkt.subject}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tkt.schoolName} • Agent: {tkt.assignedAgent.name}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      tkt.priority === 'Urgent' || tkt.priority === 'High'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {tkt.priority}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Transactions */}
          {filteredResults.transactions.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Invoices & Transactions ({filteredResults.transactions.length})
              </div>
              <div className="grid grid-cols-1 gap-1">
                {filteredResults.transactions.map((tx) => (
                  <button
                    key={tx.id}
                    onClick={() => {
                      onNavigateTab('billing');
                      onClose();
                    }}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
                  >
                    <div className="truncate pr-2">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        <span className="font-mono text-emerald-600 dark:text-emerald-400">{tx.invoiceNo}</span> — PKR {tx.netAmountPKR.toLocaleString()}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {tx.schoolName} • via {tx.paymentMethod}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 shrink-0">
                      {tx.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↑</kbd>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↓</kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">↵</kbd>
          </div>
          <span>TaleemLM Global SaaS Command Palette</span>
        </div>
      </div>
    </div>
  );
};
