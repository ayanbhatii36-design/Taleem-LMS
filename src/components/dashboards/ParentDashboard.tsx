import React, { useState } from 'react';
import {
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Award,
  CreditCard,
  MessageSquare,
  Clock,
  Send,
  Sparkles,
  PhoneCall,
  ChevronRight,
  ShieldAlert,
  Info,
  DollarSign
} from 'lucide-react';
import { ChildInfo, Message } from '../../types';

interface ParentDashboardProps {
  childrenList: ChildInfo[];
  onSelectTab: (tabId: string) => void;
  onSendMessageToTeacher: (teacherName: string, subject: string, text: string) => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({
  childrenList,
  onSelectTab,
  onSendMessageToTeacher
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || 'std-1');
  const [contactTeacherModal, setContactTeacherModal] = useState<{ teacherName: string; subject: string } | null>(null);
  const [messageText, setMessageText] = useState('');

  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  if (!activeChild) {
    return (
      <div className="p-10 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900">
        No child records linked to this parent account yet. Please contact the school administration.
      </div>
    );
  }

  const handleSend = () => {
    if (!contactTeacherModal || !messageText.trim()) return;
    onSendMessageToTeacher(contactTeacherModal.teacherName, contactTeacherModal.subject, messageText);
    setMessageText('');
    setContactTeacherModal(null);
    alert(`Message sent to ${contactTeacherModal.teacherName} regarding ${activeChild.name}`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Banner & Child Selector */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-700/60 border border-amber-500/30 text-xs font-semibold text-amber-200 backdrop-blur-md">
              <Users className="w-3.5 h-3.5" />
              <span>Parent Portal • Multi-Child Academic Tracker</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Assalam-o-Alaikum, Respected Parent!
            </h1>
            <p className="text-xs md:text-sm text-amber-100/80 max-w-xl leading-relaxed">
              Monitor your children's school attendance, daily academic performance, fee invoices, and communicate directly with their class teachers.
            </p>
          </div>

          {/* Child Switcher Pills */}
          <div className="bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/15">
            <p className="text-[10px] uppercase font-bold text-amber-200 tracking-wider mb-1.5 px-2">
              Select Child to View
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {childrenList.map((child) => {
                const isSelected = child.id === activeChild.id;
                return (
                  <button
                    key={child.id}
                    onClick={() => setSelectedChildId(child.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black scale-105'
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    <img src={child.avatar} alt={child.name} className="w-6 h-6 rounded-full object-cover" />
                    <div className="text-left">
                      <p className="leading-tight">{child.name.split(' ')[0]}</p>
                      <p className="text-[10px] opacity-80">{child.className}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Selected Child Summary Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={activeChild.avatar}
            alt={activeChild.name}
            className="w-14 h-14 rounded-2xl object-cover ring-4 ring-amber-500/20"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeChild.name}</h2>
              <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200">
                Roll No: {activeChild.rollNo}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Class: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeChild.className} ({activeChild.section})</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onSelectTab('fees')}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all border ${
              activeChild.feeStatus === 'Paid'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 text-rose-800 dark:text-rose-300'
            }`}
          >
            Fee Status: {activeChild.feeStatus} ({activeChild.pendingAmountPKR > 0 ? `PKR ${activeChild.pendingAmountPKR.toLocaleString()} Due` : 'All Paid'})
          </button>
        </div>
      </div>

      {/* Important Alerts & Warnings Box */}
      {activeChild.alerts.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Critical Alerts for {activeChild.name}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {activeChild.alerts.map((alt) => (
              <div
                key={alt.id}
                className={`p-4 rounded-2xl border flex items-start gap-3 transition-all ${
                  alt.type === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                    : alt.type === 'warning'
                    ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                    : 'bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-900/60 text-teal-900 dark:text-teal-200'
                }`}
              >
                {alt.type === 'danger' ? (
                  <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                ) : alt.type === 'warning' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-xs font-bold">{alt.text}</p>
                  <p className="text-[10px] opacity-70 mt-1">Logged: {alt.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Academic Performance & Attendance Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Widget 1: Attendance Percentage */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Attendance Record
            </h3>
            <span
              className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                activeChild.attendancePct >= 80
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}
            >
              {activeChild.attendancePct}%
            </span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-3">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                activeChild.attendancePct >= 80 ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
              style={{ width: `${activeChild.attendancePct}%` }}
            />
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            {activeChild.attendancePct >= 80
              ? 'Attendance is satisfactory and meets school regulations.'
              : 'Warning: Attendance has dropped below the required 80% threshold. Please contact the class teacher.'}
          </p>

          <button
            onClick={() => onSelectTab('attendance')}
            className="mt-4 w-full py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl transition-colors text-center"
          >
            View Monthly Attendance Breakdown
          </button>
        </div>

        {/* Widget 2: Academic GPA & Grades */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Academic Grade Average
            </h3>
            <span className="text-lg font-black text-amber-600 dark:text-amber-400">
              GPA {activeChild.gpa}
            </span>
          </div>

          <div className="space-y-2 mb-3">
            {activeChild.recentGrades.map((g, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{g.subject}</span>
                <span className="font-bold text-teal-700 dark:text-teal-300">{g.score} ({g.grade})</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => onSelectTab('assessments')}
            className="w-full py-2 text-xs font-bold text-teal-700 dark:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/60 rounded-xl transition-colors text-center"
          >
            View Detailed Report Card
          </button>
        </div>

        {/* Widget 3: Fee Voucher Status (PKR) */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Fee Voucher Summary
            </h3>
            <span className="text-xs font-bold text-slate-400">August 2026</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-slate-500">Net Due Amount:</span>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                PKR {activeChild.pendingAmountPKR.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400">
              <span>Due Date:</span>
              <span>August 15, 2026</span>
            </div>
          </div>

          <button
            onClick={() => onSelectTab('fees')}
            className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs transition-all text-center"
          >
            Pay / Download Bank Voucher
          </button>
        </div>
      </div>

      {/* Direct Teacher Communication Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Authorized Teacher Contacts ({activeChild.name})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Communicate confidentially with subject teachers regarding your child
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {activeChild.teacherContacts.map((tch, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{tch.teacherName}</h4>
                <p className="text-[11px] text-slate-500">{tch.subject} Instructor</p>
                <p className="text-[10px] text-slate-400 mt-1">{tch.phone}</p>
              </div>

              <button
                onClick={() => setContactTeacherModal({ teacherName: tch.teacherName, subject: tch.subject })}
                className="px-3 py-1.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold text-xs hover:bg-teal-200 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                Message
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Send Message Modal */}
      {contactTeacherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setContactTeacherModal(null)}
          />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              Message {contactTeacherModal.teacherName}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Context: <span className="font-semibold text-slate-800 dark:text-slate-200">{activeChild.name} ({activeChild.className})</span> - {contactTeacherModal.subject}
            </p>

            <textarea
              rows={4}
              placeholder="Type your message or inquiry here..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600 mb-4"
            />

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setContactTeacherModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20"
              >
                Send Direct Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
