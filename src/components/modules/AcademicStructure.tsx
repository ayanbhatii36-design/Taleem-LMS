import React, { useState } from 'react';
import {
  Layers,
  BookOpen,
  Plus,
  GripVertical,
  ChevronDown,
  ChevronUp,
  FileText,
  Video,
  HelpCircle,
  FileCheck,
  Award,
  Users,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { ClassItem, Course, CourseModule } from '../../types';

interface AcademicStructureProps {
  classes: ClassItem[];
  courses: Course[];
  onAddCourse: (course: Partial<Course>) => void;
}

export const AcademicStructure: React.FC<AcademicStructureProps> = ({
  classes,
  courses,
  onAddCourse
}) => {
  const [activeTab, setActiveTab] = useState<'classes' | 'courses'>('classes');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(courses[0] || null);
  const [expandedModuleId, setExpandedModuleId] = useState<string>('mod-1');

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Academic Structure & Course Modules
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage academic years, terms, classes, subjects, curriculum modules & video/PDF lessons
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('classes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'classes'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Classes & Sections ({classes.length})
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'courses'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Syllabus & Courses ({courses.length})
          </button>
        </div>
      </div>

      {activeTab === 'classes' ? (
        /* Visual Class Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <div
              key={cls.id}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 hover:border-teal-400 dark:hover:border-teal-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                    {cls.department}
                  </span>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1">
                    {cls.name} ({cls.section})
                  </h3>
                  <p className="text-xs text-slate-500">Class Teacher: <span className="font-semibold text-slate-800 dark:text-slate-200">{cls.classTeacher}</span></p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900 dark:text-white">{cls.studentCount}</span>
                  <p className="text-[10px] text-slate-400 uppercase font-bold">Students</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">Attendance Avg</p>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">{cls.attendancePct}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-semibold">GPA Performance</p>
                  <p className="font-bold text-amber-600 dark:text-amber-400">{cls.gpaAverage} / 4.0</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Enrolled Subjects ({cls.subjects.length})</p>
                <div className="flex flex-wrap gap-1">
                  {cls.subjects.map((sub, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-medium">
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Course Curriculum Manager with Modules */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Course Selector Sidebar */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Select Course Curriculum</h3>
            {courses.map((crs) => {
              const isSelected = selectedCourse?.id === crs.id;
              return (
                <button
                  key={crs.id}
                  onClick={() => setSelectedCourse(crs)}
                  className={`w-full p-4 rounded-3xl border text-left transition-all ${
                    isSelected
                      ? 'bg-teal-700 text-white border-teal-700 shadow-md shadow-teal-700/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300'}`}>
                      {crs.code}
                    </span>
                    <span className="text-[11px] opacity-80">{crs.enrolledStudents} Enrolled</span>
                  </div>
                  <h4 className="text-xs font-bold leading-snug line-clamp-2">{crs.title}</h4>
                  <p className={`text-[10px] mt-1 ${isSelected ? 'text-teal-100' : 'text-slate-400'}`}>
                    {crs.instructor}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Selected Course Detail & Drag and Drop Builder Simulation */}
          {selectedCourse && (
            <div className="lg:col-span-2 space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-[10px] font-bold rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                      {selectedCourse.code} • {selectedCourse.className}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                      {selectedCourse.title}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">{selectedCourse.description}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Course Modules & Syllabus Outline (Re-orderable)
                    </h3>
                    <button
                      onClick={() => alert('Add Module Dialog Opened')}
                      className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Module
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedCourse.modules.map((mod, idx) => {
                      const isExpanded = expandedModuleId === mod.id;
                      return (
                        <div
                          key={mod.id}
                          className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 overflow-hidden"
                        >
                          <button
                            onClick={() => setExpandedModuleId(isExpanded ? '' : mod.id)}
                            className="w-full p-3.5 flex items-center justify-between text-left hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-slate-400 cursor-grab" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{mod.title}</h4>
                                <p className="text-[10px] text-slate-400">{mod.duration} • {mod.lessons.length} Lessons</p>
                              </div>
                            </div>
                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                          </button>

                          {isExpanded && (
                            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/60 dark:border-slate-700/60 space-y-2">
                              {mod.lessons.map((les) => (
                                <div
                                  key={les.id}
                                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs"
                                >
                                  <div className="flex items-center gap-2.5">
                                    {les.type === 'video' ? (
                                      <Video className="w-4 h-4 text-blue-500" />
                                    ) : les.type === 'document' ? (
                                      <FileText className="w-4 h-4 text-emerald-500" />
                                    ) : (
                                      <HelpCircle className="w-4 h-4 text-purple-500" />
                                    )}
                                    <span className="font-semibold text-slate-800 dark:text-slate-200">{les.title}</span>
                                  </div>
                                  <span className="text-[10px] text-slate-400 font-mono">{les.duration}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
