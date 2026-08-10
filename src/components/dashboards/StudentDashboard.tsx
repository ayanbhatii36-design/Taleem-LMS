import React from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Award,
  TrendingUp,
  CheckCircle,
  FileText,
  AlertCircle,
  Download,
  ChevronRight,
  Sparkles,
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import {
  Student,
  Course,
  Assignment,
  Exam,
  GradeRecord,
  TimetableSlot,
  Announcement
} from '../../types';

interface StudentDashboardProps {
  student: Student;
  courses: Course[];
  assignments: Assignment[];
  exams: Exam[];
  grades: GradeRecord[];
  timetable: TimetableSlot[];
  announcements: Announcement[];
  onSelectTab: (tabId: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  courses,
  assignments,
  exams,
  grades,
  timetable,
  announcements,
  onSelectTab
}) => {
  const pendingAssignments = assignments.filter((a) => a.submissionStatus === 'Pending');
  const upcomingExams = exams.filter((e) => e.status === 'Upcoming');
  const todayClasses = timetable.filter((t) => t.day === 'Monday' || t.day === 'Tuesday').slice(0, 4);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Motivating Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-800 via-teal-900 to-slate-900 text-white p-6 md:p-8 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-700/60 border border-teal-500/30 text-xs font-semibold text-teal-200 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Academic Year 2025 - 2026 • FBISE Board Pattern</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Assalam-o-Alaikum, {student.name}! 👋
            </h1>
            <p className="text-xs md:text-sm text-teal-100/80 max-w-xl leading-relaxed">
              You are enrolled in <span className="font-semibold text-white">{student.className} ({student.section})</span>. Keep up the disciplined routine for upcoming Midterm exams!
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="flex items-center gap-3 self-start md:self-auto bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-teal-200 font-medium">Attendance</p>
              <p className="text-xl font-black text-white">{student.attendancePct}%</p>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <p className="text-[10px] uppercase tracking-wider text-teal-200 font-medium">Current GPA</p>
              <p className="text-xl font-black text-amber-300">{student.gpa}</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase tracking-wider text-teal-200 font-medium">Pending Tasks</p>
              <p className="text-xl font-black text-white">{pendingAssignments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Widget 1: Attendance Percentage */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Attendance Status</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {student.attendancePct}%
            </h3>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Above 80% Threshold
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 2: Current GPA / Grades */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Current Average GPA</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {student.gpa} <span className="text-xs text-slate-400 font-normal">/ 4.0</span>
            </h3>
            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-1">
              Grade A1 (92% Aggregate)
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 3: Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Assignments Due</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {pendingAssignments.length}
            </h3>
            <p className="text-[11px] text-rose-500 font-medium mt-1">
              Next due in 3 days
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        {/* Widget 4: Upcoming Exams */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Scheduled Exams</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {upcomingExams.length}
            </h3>
            <p className="text-[11px] text-purple-600 dark:text-purple-400 font-medium mt-1">
              Midterms start Aug 25
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-300 flex items-center justify-center font-bold">
            <Calendar className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Continue Learning Section */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              Continue Learning
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Pick up where you left off in your FBISE subjects
            </p>
          </div>
          <button
            onClick={() => onSelectTab('academic-structure')}
            className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline flex items-center gap-1"
          >
            All Courses <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {courses.map((course) => (
            <div
              key={course.id}
              className="group p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 hover:border-teal-300 dark:hover:border-teal-700 transition-all"
            >
              <div className="relative h-28 rounded-xl overflow-hidden mb-3">
                <img
                  src={course.coverImage}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-slate-900/80 text-white text-[10px] font-bold backdrop-blur-xs">
                  {course.code}
                </span>
              </div>

              <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                {course.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Instructor: {course.instructor}
              </p>

              {/* Course Progress */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Course Progress</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300">{course.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-teal-600 rounded-full transition-all duration-500"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">{course.modulesCount} Modules</span>
                <button
                  onClick={() => onSelectTab('academic-structure')}
                  className="px-3 py-1.5 rounded-lg bg-teal-700 hover:bg-teal-800 text-white font-semibold text-[11px] shadow-xs flex items-center gap-1"
                >
                  Resume <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Split Section: Today's Schedule & Academic Progress / Recent Grades */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Today's Classes & Pending Assignments */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Classes */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                Today's Class Schedule
              </h3>
              <button
                onClick={() => onSelectTab('timetable')}
                className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
              >
                View Full Timetable
              </button>
            </div>

            <div className="space-y-2.5">
              {todayClasses.map((slot) => (
                <div
                  key={slot.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-xs font-bold">
                      {slot.startTime}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {slot.subject}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Teacher: {slot.teacherName} • Room: {slot.room}
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {slot.className} ({slot.section})
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                Pending Assignments & Submissions
              </h3>
              <button
                onClick={() => onSelectTab('assessments')}
                className="text-xs font-bold text-teal-700 dark:text-teal-300 hover:underline"
              >
                Assignments Hub
              </button>
            </div>

            <div className="space-y-3">
              {assignments.map((asg) => (
                <div
                  key={asg.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300">
                        {asg.subject}
                      </span>
                      <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        Due: {asg.dueDate}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">{asg.title}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-1">{asg.instructions}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {asg.submissionStatus === 'Graded' ? (
                      <span className="px-3 py-1 text-xs font-bold rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        Graded: {asg.marksObtained}/{asg.totalMarks} ({asg.grade})
                      </span>
                    ) : (
                      <button
                        onClick={() => onSelectTab('assessments')}
                        className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
                      >
                        Submit File
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Academic Performance & Recent Announcements */}
        <div className="space-y-6">
          {/* Recent Grades */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Recent Exam Marks
            </h3>

            <div className="space-y-3">
              {grades.map((grd) => (
                <div
                  key={grd.id}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{grd.subject}</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{grd.gradeLetter}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>{grd.marksObtained} / {grd.totalMarks} ({grd.percentage}%)</span>
                    <span>{grd.date}</span>
                  </div>
                  <p className="text-[10px] text-slate-400 italic mt-1">"{grd.remarks}"</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommended Study Material Downloads */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <Download className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              Recommended Study Materials
            </h3>

            <div className="space-y-2.5">
              {[
                { name: 'Physics FBISE Solved Past Papers (5 Yrs)', size: '4.2 MB', type: 'PDF' },
                { name: 'Chemistry Practical Lab Handbook', size: '2.8 MB', type: 'PDF' },
                { name: 'Mathematics Important Formulas Sheet', size: '1.1 MB', type: 'PDF' }
              ].map((mat, i) => (
                <div
                  key={i}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{mat.name}</p>
                    <p className="text-[10px] text-slate-400">{mat.type} • {mat.size}</p>
                  </div>
                  <button
                    onClick={() => alert(`Downloading ${mat.name}...`)}
                    className="p-2 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 hover:bg-teal-200 transition-colors shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
