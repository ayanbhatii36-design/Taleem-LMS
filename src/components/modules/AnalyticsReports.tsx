import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  TrendingUp,
  FileText,
  DollarSign,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const classPerformanceData = [
  { class: 'Class 10-A', gpa: 3.68, passPct: 98 },
  { class: 'Class 9-Sci', gpa: 3.42, passPct: 94 },
  { class: 'F.Sc 1 Pre-Med', gpa: 3.82, passPct: 99 },
  { class: 'Class 8-B', gpa: 3.35, passPct: 91 }
];

const gradeDistribution = [
  { name: 'Grade A1 (90%+)', count: 420, color: '#0f766e' },
  { name: 'Grade A (80-89%)', count: 510, color: '#3b82f6' },
  { name: 'Grade B (70-79%)', count: 210, color: '#f59e0b' },
  { name: 'Grade C (60-69%)', count: 88, color: '#ef4444' }
];

export const AnalyticsReports: React.FC = () => {
  const [selectedTerm, setSelectedTerm] = useState('First Term 2026');

  const handleExportPDF = () => {
    alert('Generating Executive Institutional PDF Report...');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Analytics & Executive Institutional Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export official PDF/CSV reports for board audits, attendance metrics & PKR financial growth
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportPDF}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export Executive PDF
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300">Term Filter:</label>
          <select
            value={selectedTerm}
            onChange={(e) => setSelectedTerm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl font-bold"
          >
            <option value="First Term 2026">First Term 2026</option>
            <option value="Midterm 2026">Midterm Board Mocks 2026</option>
            <option value="Annual 2025">Annual 2025</option>
          </select>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class GPA Comparison */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Class GPA Performance Comparison</h3>
          <p className="text-xs text-slate-500 mb-4">Average GPA across sections</p>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                <XAxis dataKey="class" stroke="#94a3b8" fontSize={11} />
                <YAxis domain={[0, 4.0]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Bar dataKey="gpa" fill="#0f766e" radius={[6, 6, 0, 0]} name="Class GPA" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution Pie Chart */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">Overall Student Grade Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Aggregate scores in 2026 examinations</p>
          <div className="h-60 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={gradeDistribution} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {gradeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
