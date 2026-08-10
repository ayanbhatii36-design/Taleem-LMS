import React from 'react';
import {
  CalendarCheck,
  FileCheck,
  Award,
  BookOpen,
  Clock,
  PlusCircle,
  Users,
  CheckCircle,
  AlertCircle,
  ChevronRight,
  Upload,
  UserCheck
} from 'lucide-react';
import { Teacher, ClassItem, Assignment, Exam, TimetableSlot } from '../../types';

interface TeacherDashboardProps {
  teacher: Teacher;
  classes: ClassItem[];
  assignments: Assignment[];
  exams: Exam[];
  timetable: TimetableSlot[];
  onSelectTab: (tabId: string) => void;
  onOpenTakeAttendance: (className: string) => void;
  onOpenCreateAssignment: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  classes,
  assignments,
  exams,
  timetable,
  onSelectTab,
  onOpenTakeAttendance,
  onOpenCreateAssignment
}) => {
  const teacherSlots = timetable.filter((t) => t.day === 'Monday' || t.day === 'Tuesday').slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Faculty Hero Banner */}
      <div className="bg-gradient-to-r from-blue-800 via-blue-900 to-slate-900 text-white p-6 md:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-700/60 border border-blue-500/30 text-xs font-semibold text-blue-200 backdrop-blur-md mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Faculty Command Workspace</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">
            Assalam-o-Alaikum, {teacher.name}!
          </h1>
          <p className="text-xs md:text-sm text-blue-100/80 mt-1">
            {teacher.designation} • {teacher.department} Department
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenTakeAttendance(classes[0]?.name || 'Class 10')}
            className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all"
          >
            <CalendarCheck className="w-4 h-4" />
            Take Attendance
          </button>
          <button
            onClick={onOpenCreateAssignment}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            Create Assignment
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assigned Classes</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {teacher.assignedClasses.length} Classes
            </h3>
            <p className="text-[11px] text-blue-600 font-medium mt-1">
              115 Total Students
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Today</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {teacher.attendancePct}%
            </h3>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              Class 10-A Pending
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">To be Graded</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              28 Submissions
            </h3>
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              Physics Assignment 3
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Faculty Rating</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {teacher.performanceRating} / 5.0
            </h3>
            <p className="text-[11px] text-amber-600 font-medium mt-1">
              Top 5% Educator
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Class Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Assigned Classes & Academic Performance
          </h2>
          <button
            onClick={() => onSelectTab('academic-structure')}
            className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
          >
            Manage Course Material
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{cls.name} ({cls.section})</h3>
                  <p className="text-[11px] text-slate-500">{cls.department}</p>
                </div>
                <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-md bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200">
                  {cls.studentCount} Students
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400">Attendance</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200">{cls.attendancePct}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">Class Average</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">GPA {cls.gpaAverage}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onOpenTakeAttendance(cls.name)}
                  className="flex-1 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs transition-colors text-center"
                >
                  Mark Attendance
                </button>
                <button
                  onClick={() => onSelectTab('assessments')}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 transition-colors"
                >
                  Marks
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Schedule & Grading Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Schedule */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Today's Lecture Schedule
          </h3>

          <div className="space-y-2.5">
            {teacherSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
                    {slot.startTime}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{slot.subject}</h4>
                    <p className="text-[11px] text-slate-500">{slot.className} ({slot.section}) • {slot.room}</p>
                  </div>
                </div>

                <button
                  onClick={() => onOpenTakeAttendance(slot.className)}
                  className="px-3 py-1.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold hover:bg-teal-200"
                >
                  Start Class
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Assignments Grading Queue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-rose-500" />
            Submissions Awaiting Grading
          </h3>

          <div className="space-y-3">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                  <p className="text-[10px] text-slate-500">{asg.className} • Submitted: {asg.submissionsCount} / {asg.totalStudentsCount}</p>
                </div>

                <button
                  onClick={() => onSelectTab('assessments')}
                  className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
                >
                  Grade Now
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
