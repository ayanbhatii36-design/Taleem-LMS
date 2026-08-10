import React, { useState } from 'react';
import {
  Award,
  FileText,
  Plus,
  CheckCircle2,
  Clock,
  Calendar,
  FileUp,
  Download,
  Edit,
  Trash2,
  Sparkles,
  Users
} from 'lucide-react';
import { UserRole, Assignment, Exam, GradeRecord } from '../../types';

interface AssessmentModuleProps {
  currentRole: UserRole;
  assignments: Assignment[];
  exams: Exam[];
  grades: GradeRecord[];
  onAddAssignment: (asg: Partial<Assignment>) => void;
  onAddExam: (exam: Partial<Exam>) => void;
}

export const AssessmentModule: React.FC<AssessmentModuleProps> = ({
  currentRole,
  assignments,
  exams,
  grades,
  onAddAssignment,
  onAddExam
}) => {
  const [activeTab, setActiveTab] = useState<'assignments' | 'exams' | 'gradebook'>('assignments');
  const [gradingSystem, setGradingSystem] = useState<'Percentage (Board)' | 'GPA 4.0' | 'Cambridge (A*-U)'>('Percentage (Board)');
  const [showAddAssignmentModal, setShowAddAssignmentModal] = useState(false);

  // New assignment form state
  const [newAsg, setNewAsg] = useState({
    title: '',
    subject: 'Physics',
    className: 'Class 10',
    dueDate: '2026-08-20',
    totalMarks: 25,
    instructions: ''
  });

  const handleCreateAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsg.title) return;
    onAddAssignment({
      ...newAsg,
      teacherName: 'Sir Farooq Ahmed',
      submissionStatus: 'Pending',
      fileCount: 1,
      submissionsCount: 0,
      totalStudentsCount: 38
    });
    setShowAddAssignmentModal(false);
    alert(`Assignment "${newAsg.title}" published successfully!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-500" />
            Academic Assessment & Gradebook
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Assignments hub, Board examination date sheets, marksheets, and configurable grading systems
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'assignments'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Assignments ({assignments.length})
          </button>
          <button
            onClick={() => setActiveTab('exams')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'exams'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Exams Date Sheet ({exams.length})
          </button>
          <button
            onClick={() => setActiveTab('gradebook')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'gradebook'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Gradebook
          </button>
        </div>
      </div>

      {activeTab === 'assignments' ? (
        /* Assignments View */
        <div className="space-y-4">
          {(currentRole === 'teacher' || currentRole === 'principal') && (
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddAssignmentModal(true)}
                className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Create New Assignment
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignments.map((asg) => (
              <div
                key={asg.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {asg.subject} • {asg.className} ({asg.section})
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1">{asg.title}</h3>
                    <p className="text-[11px] text-slate-500">Teacher: {asg.teacherName}</p>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-black rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 border border-amber-200 dark:border-amber-800">
                    {asg.totalMarks} Marks
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl line-clamp-2">
                  {asg.instructions}
                </p>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="font-semibold text-rose-600 dark:text-rose-400">Due: {asg.dueDate}</span>
                  {currentRole === 'student' ? (
                    <button
                      onClick={() => alert(`Submitting homework for ${asg.title}...`)}
                      className="px-3.5 py-1.5 rounded-xl bg-teal-700 text-white font-bold shadow-xs flex items-center gap-1"
                    >
                      <FileUp className="w-3.5 h-3.5" /> Submit Homework
                    </button>
                  ) : (
                    <span className="text-slate-500 font-medium">
                      Submissions: {asg.submissionsCount} / {asg.totalStudentsCount}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : activeTab === 'exams' ? (
        /* Exam Date Sheets */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((ex) => (
              <div
                key={ex.id}
                className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300">
                    {ex.term}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">Room: {ex.roomNo}</span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{ex.title}</h3>
                <p className="text-xs text-slate-500">{ex.subject} • {ex.className} ({ex.section})</p>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Date:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ex.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Time:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{ex.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total / Passing:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{ex.totalMarks} / {ex.passingMarks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Gradebook & Configurable Grading Scheme */
        <div className="space-y-4">
          {/* Configurable Grading System Switcher */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Institutional Grading Scheme</h3>
              <p className="text-xs text-slate-500">Pakistani Board Percentage (BISE) vs GPA vs Cambridge</p>
            </div>

            <div className="flex items-center gap-2">
              {(['Percentage (Board)', 'GPA 4.0', 'Cambridge (A*-U)'] as const).map((scheme) => (
                <button
                  key={scheme}
                  onClick={() => setGradingSystem(scheme)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    gradingSystem === scheme
                      ? 'bg-amber-500 text-slate-950 shadow-xs font-black'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {scheme}
                </button>
              ))}
            </div>
          </div>

          {/* Marks Table */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Roll No</th>
                    <th className="p-3.5">Student Name</th>
                    <th className="p-3.5">Subject</th>
                    <th className="p-3.5">Exam Title</th>
                    <th className="p-3.5 text-center">Marks Obtained</th>
                    <th className="p-3.5 text-center">Percentage</th>
                    <th className="p-3.5 text-center">Grade ({gradingSystem.split(' ')[0]})</th>
                    <th className="p-3.5">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {grades.map((grd) => (
                    <tr key={grd.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white font-mono">{grd.rollNo}</td>
                      <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{grd.studentName}</td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{grd.subject}</td>
                      <td className="p-3.5 text-slate-500">{grd.examTitle}</td>
                      <td className="p-3.5 text-center font-bold text-slate-900 dark:text-white">{grd.marksObtained} / {grd.totalMarks}</td>
                      <td className="p-3.5 text-center font-bold text-teal-700 dark:text-teal-300">{grd.percentage}%</td>
                      <td className="p-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black">
                          {grd.gradeLetter}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 italic">{grd.remarks}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Add Assignment Modal */}
      {showAddAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddAssignmentModal(false)} />
          <form onSubmit={handleCreateAssignment} className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Publish New Assignment</h3>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Title</label>
              <input
                type="text"
                required
                value={newAsg.title}
                onChange={(e) => setNewAsg({ ...newAsg, title: e.target.value })}
                className="w-full p-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                placeholder="e.g. Physics Numerical Worksheet 4"
              />
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Subject</label>
                <input
                  type="text"
                  value={newAsg.subject}
                  onChange={(e) => setNewAsg({ ...newAsg, subject: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Due Date</label>
                <input
                  type="date"
                  value={newAsg.dueDate}
                  onChange={(e) => setNewAsg({ ...newAsg, dueDate: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Instructions</label>
              <textarea
                rows={3}
                value={newAsg.instructions}
                onChange={(e) => setNewAsg({ ...newAsg, instructions: e.target.value })}
                className="w-full p-2.5 mt-1 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
                placeholder="Details or chapter references..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setShowAddAssignmentModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl">
                Publish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
