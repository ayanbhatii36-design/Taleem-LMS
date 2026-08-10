import React, { useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  Search,
  Filter,
  CheckSquare,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { UserRole, Student, ClassItem, AttendanceRecord } from '../../types';

interface AttendanceModuleProps {
  currentRole: UserRole;
  students: Student[];
  classes: ClassItem[];
  defaultClassName?: string;
}

export const AttendanceModule: React.FC<AttendanceModuleProps> = ({
  currentRole,
  students,
  classes,
  defaultClassName = 'Class 10'
}) => {
  const [selectedClass, setSelectedClass] = useState<string>(defaultClassName);
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().slice(0, 10));
  
  // Local state for fast attendance marking
  const [markingState, setMarkingState] = useState<Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'>>({
    'std-1': 'Present',
    'std-2': 'Absent',
    'std-3': 'Present',
    'std-4': 'Late',
    'std-5': 'Present'
  });

  const classStudents = students.filter((s) => s.className.includes(selectedClass) || selectedClass === 'All');

  const handleStatusChange = (studentId: string, status: 'Present' | 'Absent' | 'Late' | 'Excused') => {
    setMarkingState((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSelectAllPresent = () => {
    const updated: Record<string, 'Present' | 'Absent' | 'Late' | 'Excused'> = {};
    classStudents.forEach((s) => {
      updated[s.id] = 'Present';
    });
    setMarkingState((prev) => ({ ...prev, ...updated }));
  };

  const handleSaveAttendance = () => {
    alert(`Attendance for ${selectedClass} on ${attendanceDate} saved successfully.`);
  };

  const presentCount = Object.values(markingState).filter((st) => st === 'Present').length;
  const absentCount = Object.values(markingState).filter((st) => st === 'Absent').length;
  const lateCount = Object.values(markingState).filter((st) => st === 'Late').length;

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Attendance Management Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {currentRole === 'teacher' || currentRole === 'principal'
              ? 'Mark daily attendance, generate class statistics, and monitor attendance thresholds'
              : 'View monthly attendance records and compliance status'}
          </p>
        </div>

        {(currentRole === 'teacher' || currentRole === 'principal') && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectAllPresent}
              className="px-3.5 py-2 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-colors flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" />
              1-Click Mark All Present
            </button>
            <button
              onClick={handleSaveAttendance}
              className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all"
            >
              Submit Attendance
            </button>
          </div>
        )}
      </div>

      {/* Class & Date Selector Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Select Class:</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
            >
              <option value="Class 10">Class 10-A (Pre-Engineering)</option>
              <option value="Class 9">Class 9 (Science B)</option>
              <option value="Class 8">Class 8-B</option>
              <option value="F.Sc Part 1">F.Sc Part 1 (Pre-Medical)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Date:</label>
            <input
              type="date"
              value={attendanceDate}
              onChange={(e) => setAttendanceDate(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-semibold focus:outline-none"
            />
          </div>
        </div>

        {/* Real-time Summary Pills */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <span className="px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
            Present: {presentCount}
          </span>
          <span className="px-3 py-1 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
            Absent: {absentCount}
          </span>
          <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
            Late: {lateCount}
          </span>
        </div>
      </div>

      {/* Attendance Fast Marking Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-4">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Guardian Contact</th>
                <th className="p-3.5 text-center">Current Term Attendance %</th>
                <th className="p-3.5 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {classStudents.map((std) => {
                const currentStatus = markingState[std.id] || 'Present';
                const isLowAttendance = std.attendancePct < 80;

                return (
                  <tr key={std.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white font-mono">
                      {std.rollNo}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img src={std.avatar} alt={std.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{std.name}</p>
                          <p className="text-[10px] text-slate-400">{std.className} ({std.section})</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800 dark:text-slate-200">{std.guardianName}</p>
                      <p className="text-[10px] text-slate-400">{std.phone}</p>
                    </td>
                    <td className="p-3.5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <span
                          className={`font-black text-xs ${
                            isLowAttendance ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {std.attendancePct}%
                        </span>
                        {isLowAttendance && (
                          <span title="Attendance dropped below 80% threshold!">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 text-center">
                      {/* Interactive Radio Toggle Buttons */}
                      <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/80 dark:border-slate-700">
                        {(['Present', 'Absent', 'Late', 'Excused'] as const).map((st) => {
                          const isActive = currentStatus === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleStatusChange(std.id, st)}
                              className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                isActive
                                  ? st === 'Present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : st === 'Absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : st === 'Late'
                                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                                    : 'bg-blue-600 text-white shadow-xs'
                                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                              }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
