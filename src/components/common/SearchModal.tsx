import React, { useState } from 'react';
import { Search, X, GraduationCap, Users, BookOpen, CreditCard, ChevronRight } from 'lucide-react';
import { Student, Teacher, ClassItem, FeeInvoice, Course } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  students?: Student[];
  teachers?: Teacher[];
  classes?: ClassItem[];
  feeInvoices?: FeeInvoice[];
  courses?: Course[];
  onSelectTab?: (tabId: string) => void;
  onNavigate?: (tabId: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  students = [],
  teachers = [],
  classes = [],
  feeInvoices = [],
  courses = [],
  onSelectTab,
  onNavigate
}) => {
  const [query, setQuery] = useState('');

  if (!isOpen) return null;

  const navigateTo = (tabId: string) => {
    if (onNavigate) onNavigate(tabId);
    else if (onSelectTab) onSelectTab(tabId);
  };

  const trimmed = query.trim().toLowerCase();

  const matchingStudents = trimmed
    ? (students || []).filter(
        (s) =>
          (s.name || '').toLowerCase().includes(trimmed) ||
          (s.rollNo || '').toLowerCase().includes(trimmed) ||
          (s.className || '').toLowerCase().includes(trimmed)
      )
    : [];

  const matchingTeachers = trimmed
    ? (teachers || []).filter(
        (t) =>
          (t.name || '').toLowerCase().includes(trimmed) ||
          (t.subjects || []).some((sub) => (sub || '').toLowerCase().includes(trimmed)) ||
          (t.department || '').toLowerCase().includes(trimmed)
      )
    : [];

  const matchingClasses = trimmed
    ? (classes || []).filter(
        (c) =>
          (c.name || '').toLowerCase().includes(trimmed) ||
          (c.section || '').toLowerCase().includes(trimmed)
      )
    : [];

  const matchingInvoices = trimmed
    ? (feeInvoices || []).filter(
        (inv) =>
          (inv.studentName || '').toLowerCase().includes(trimmed) ||
          (inv.invoiceNo || '').toLowerCase().includes(trimmed) ||
          (inv.month || '').toLowerCase().includes(trimmed)
      )
    : [];

  const matchingCourses = trimmed
    ? (courses || []).filter(
        (c) =>
          (c.title || '').toLowerCase().includes(trimmed) ||
          (c.code || '').toLowerCase().includes(trimmed) ||
          (c.className || '').toLowerCase().includes(trimmed)
      )
    : [];

  const totalResults =
    matchingStudents.length + matchingTeachers.length + matchingClasses.length + matchingInvoices.length + matchingCourses.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Search Bar Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50">
          <Search className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search students, roll numbers, teachers, subjects, classes, PKR invoices..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
          >
            ESC
          </button>
        </div>

        {/* Results Body */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {!trimmed ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <Search className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-xs font-medium">Start typing to search institute records...</p>
              <div className="flex items-center justify-center gap-2 mt-4 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Try "Aayan"</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Try "Class 10"</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800">Try "Physics"</span>
              </div>
            </div>
          ) : totalResults === 0 ? (
            <div className="text-center py-8 text-slate-400 dark:text-slate-500">
              <p className="text-xs font-medium">No results found for "{query}"</p>
            </div>
          ) : (
            <>
              {/* Students */}
              {matchingStudents.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Students ({matchingStudents.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingStudents.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => {
                          navigateTo('students');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-100 dark:border-slate-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</p>
                            <p className="text-[10px] text-slate-500">{s.rollNo} • {s.className} ({s.section})</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Teachers */}
              {matchingTeachers.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" /> Faculty ({matchingTeachers.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingTeachers.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => {
                          navigateTo('teachers');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-100 dark:border-slate-800 transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <img src={t.avatar} alt={t.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="text-xs font-bold text-slate-900 dark:text-white">{t.name}</p>
                            <p className="text-[10px] text-slate-500">{t.designation} • {t.subjects.join(', ')}</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Invoices */}
              {matchingInvoices.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" /> Fee Invoices ({matchingInvoices.length})
                  </h4>
                  <div className="space-y-1.5">
                    {matchingInvoices.map((inv) => (
                      <button
                        key={inv.id}
                        onClick={() => {
                          navigateTo('fees');
                          onClose();
                        }}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-teal-50 dark:hover:bg-teal-950/50 border border-slate-100 dark:border-slate-800 transition-colors text-left"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{inv.invoiceNo} - {inv.studentName}</p>
                          <p className="text-[10px] text-slate-500">{inv.month} • Rs. {inv.netAmountPKR.toLocaleString()} • Status: {inv.status}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
