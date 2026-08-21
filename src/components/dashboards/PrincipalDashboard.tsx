import React from 'react';
import {
  Users,
  GraduationCap,
  CalendarCheck,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  PlusCircle,
  Bell,
  ShieldCheck
} from 'lucide-react';
import { Student, Teacher, ClassItem, FeeInvoice, Announcement } from '../../types';

interface PrincipalDashboardProps {
  students: Student[];
  teachers: Teacher[];
  classes: ClassItem[];
  feeInvoices: FeeInvoice[];
  announcements: Announcement[];
  instituteName?: string;
  onSelectTab: (tabId: string) => void;
  onOpenAddStudent: () => void;
  onOpenAddTeacher: () => void;
  onOpenAddAnnouncement: () => void;
}

export const PrincipalDashboard: React.FC<PrincipalDashboardProps> = ({
  students,
  teachers,
  classes,
  feeInvoices,
  announcements,
  instituteName = 'ADD YOUR INSTITUTE',
  onSelectTab,
  onOpenAddStudent,
  onOpenAddTeacher,
  onOpenAddAnnouncement
}) => {
  const atRiskStudents = students.filter((s) => s.attendancePct < 85 || s.gpa < 3.2);
  const totalStudents = students.length;
  const totalTeachers = teachers.length;
  const totalFeesPKR = feeInvoices.reduce((acc, inv) => acc + inv.netAmountPKR, 0);
  const pendingFeesPKR = feeInvoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((acc, inv) => acc + inv.netAmountPKR, 0);
  const avgAttendancePct = totalStudents > 0
    ? Math.round(students.reduce((acc, s) => acc + s.attendancePct, 0) / totalStudents)
    : 0;
  const presentToday = Math.round((avgAttendancePct / 100) * totalStudents);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/30 text-xs font-semibold text-teal-200 backdrop-blur-md mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Institute Executive Command Center</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            {instituteName}
          </h1>
          <p className="text-xs md:text-sm text-teal-100/80 mt-1">
            Real-time administrative overview of campus performance, faculty, enrollment, and PKR financial analytics.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddStudent}
            className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </button>
          <button
            onClick={onOpenAddTeacher}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Add Teacher
          </button>
          <button
            onClick={onOpenAddAnnouncement}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <Bell className="w-4 h-4" />
            Post Notice
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Enrolled Students</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalStudents.toLocaleString()}
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> {classes.length} classes on record
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faculty & Staff</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalTeachers}
            </h3>
            <p className="text-[11px] text-teal-600 font-medium mt-1">
              Teachers on faculty
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Attendance</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {avgAttendancePct}%
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              {presentToday} of {totalStudents} students present
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Fee Collections</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              PKR {(totalFeesPKR / 1000000).toFixed(2)} M
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              PKR {(pendingFeesPKR / 1000).toFixed(0)}k pending
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Split Row: At-Risk Students & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Students */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              At-Risk Students Requiring Follow-up
            </h3>
            <button
              onClick={() => onSelectTab('students')}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              All Students
            </button>
          </div>

          <div className="space-y-2.5">
            {atRiskStudents.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img src={s.avatar} alt={s.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{s.name}</h4>
                    <p className="text-[10px] text-slate-500">{s.className} ({s.section}) • Guardian: {s.guardianName}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                    Att: {s.attendancePct}%
                  </span>
                  <p className="text-[10px] text-slate-400">GPA: {s.gpa}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Announcements */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Recent Institute Notices
            </h3>
            <button
              onClick={() => onSelectTab('announcements')}
              className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
            >
              Manage Notices
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((anc) => (
              <div
                key={anc.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {anc.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{anc.date}</span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{anc.title}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{anc.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
