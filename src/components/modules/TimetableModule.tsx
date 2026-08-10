import React, { useState } from 'react';
import {
  Clock,
  Printer,
  Plus,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Users
} from 'lucide-react';
import { TimetableSlot } from '../../types';

interface TimetableModuleProps {
  timetable: TimetableSlot[];
  onAddSlot?: (slot: Partial<TimetableSlot>) => void;
}

export const TimetableModule: React.FC<TimetableModuleProps> = ({
  timetable,
  onAddSlot
}) => {
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [showConflict, setShowConflict] = useState(true);

  const days: ('Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday')[] = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday'
  ];

  const timeSlots = [
    { start: '08:30 AM', end: '09:15 AM' },
    { start: '09:15 AM', end: '10:00 AM' },
    { start: '10:00 AM', end: '10:45 AM' },
    { start: '10:45 AM', end: '11:15 AM', label: 'Recess / Break' },
    { start: '11:15 AM', end: '12:00 PM' },
    { start: '12:00 PM', end: '12:45 PM' }
  ];

  // Conflict Detection Algorithm: Check if any teacher or room is double-booked at same day & time slot
  const conflicts: string[] = [];
  timetable.forEach((slot, idx) => {
    timetable.forEach((other, oIdx) => {
      if (
        idx !== oIdx &&
        slot.day === other.day &&
        slot.startTime === other.startTime &&
        (slot.teacherName === other.teacherName || slot.room === other.room)
      ) {
        const msg = `Conflict on ${slot.day} at ${slot.startTime}: ${slot.teacherName} double booked in ${slot.className} and ${other.className}`;
        if (!conflicts.includes(msg)) conflicts.push(msg);
      }
    });
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Timetable Scheduler & Conflict Detector
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Interactive weekly schedule with automated room and teacher double-booking detection
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4" /> Print Timetable
          </button>
        </div>
      </div>

      {/* Conflict Warning Box */}
      {showConflict && conflicts.length > 0 && (
        <div className="p-4 rounded-3xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-rose-900 dark:text-rose-200">
              Timetable Schedule Conflicts Detected! ({conflicts.length})
            </h4>
            <ul className="text-xs text-rose-700 dark:text-rose-300 list-disc list-inside mt-1 space-y-0.5">
              {conflicts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Class Selector Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">View Schedule For:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-bold focus:outline-none"
          >
            <option value="Class 10">Class 10-A (Pre-Engineering)</option>
            <option value="Class 9">Class 9 (Science B)</option>
            <option value="F.Sc Part 1">F.Sc Part 1</option>
          </select>
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs text-center min-w-[700px]">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <th className="p-3 w-28 text-left pl-4">Time Slot</th>
                {days.map((d) => (
                  <th key={d} className="p-3 font-bold text-slate-900 dark:text-white">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {timeSlots.map((ts, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                  <td className="p-3.5 pl-4 text-left font-mono font-bold text-slate-500 bg-slate-50/50 dark:bg-slate-800/30">
                    <p className="text-slate-900 dark:text-white">{ts.start}</p>
                    <p className="text-[10px] text-slate-400">{ts.end}</p>
                  </td>

                  {ts.label ? (
                    <td colSpan={5} className="p-3 font-bold text-slate-400 uppercase bg-amber-50/50 dark:bg-amber-950/20 tracking-widest text-[10px]">
                      {ts.label}
                    </td>
                  ) : (
                    days.map((day) => {
                      const slot = timetable.find(
                        (t) => t.day === day && t.startTime === ts.start && t.className.includes(selectedClass)
                      );

                      return (
                        <td key={day} className="p-2 border-l border-slate-100 dark:border-slate-800/60">
                          {slot ? (
                            <div className="p-2.5 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 text-left space-y-0.5">
                              <p className="font-bold text-teal-900 dark:text-teal-200">{slot.subject}</p>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">{slot.teacherName}</p>
                              <span className="inline-block px-1.5 py-0.2 rounded bg-teal-200/60 dark:bg-teal-900 text-[9px] font-bold text-teal-900 dark:text-teal-200">
                                {slot.room}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-300 italic">Free Slot</span>
                          )}
                        </td>
                      );
                    })
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
