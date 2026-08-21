import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Building2, 
  MapPin, 
  PieChart as PieIcon, 
  DollarSign, 
  HardDrive,
  Download
} from 'lucide-react';
import { SchoolTenant, PaymentTransaction } from '../types';

interface PlatformAnalyticsViewProps {
  schools: SchoolTenant[];
  transactions: PaymentTransaction[];
}

export const PlatformAnalyticsView: React.FC<PlatformAnalyticsViewProps> = ({
  schools,
  transactions
}) => {
  const totalStudents = schools.reduce((acc, s) => acc + s.studentCount, 0);
  const totalTeachers = schools.reduce((acc, s) => acc + s.teacherCount, 0);
  const totalMRR = schools.filter(s => s.status === 'Active').reduce((acc, s) => acc + s.monthlyFeePKR, 0);

  const paidRevenuePKR = transactions
    .filter(t => t.status === 'Paid')
    .reduce((acc, t) => acc + t.netAmountPKR, 0);

  const monthlyIntakePct = schools.length === 0
    ? 0
    : Math.round((schools.filter(s => s.createdDate.slice(0, 7) === new Date().toISOString().slice(0, 7)).length / schools.length) * 100);

  const teacherStudentRatio = totalTeachers === 0
    ? '1:0'
    : `1:${Math.round(totalStudents / totalTeachers)}`;

  // Province Breakdown
  const provinceCounts: Record<string, number> = {};
  schools.forEach(s => {
    provinceCounts[s.province] = (provinceCounts[s.province] || 0) + 1;
  });

  // Curriculum Breakdown
  const curriculumCounts: Record<string, number> = {};
  schools.forEach(s => {
    curriculumCounts[s.academicSystem] = (curriculumCounts[s.academicSystem] || 0) + s.studentCount;
  });

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Intelligence & Regional Analytics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              National Footprint
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time enrollment dynamics, Pakistani provincial distribution, curriculum adoption, and financial velocity.
          </p>
        </div>
      </div>

      {/* Top 5 Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Enrolled Students</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalStudents.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>{monthlyIntakePct}% monthly intake</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Active Faculty / Teachers</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {totalTeachers.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-teal-600 font-bold">
            {teacherStudentRatio} Teacher-to-Student Ratio
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Platform Annual Run Rate (ARR)</div>
          <div className="mt-2 text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">
            PKR {((totalMRR * 12) / 1000000).toFixed(1)}M
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-bold">
            Based on active subscriptions
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Average Revenue Per School</div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            PKR {Math.round(totalMRR / (schools.length || 1)).toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Per month in PKR
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="text-xs font-bold text-slate-400 uppercase">Revenue Collected (YTD)</div>
          <div className="mt-2 text-2xl font-black text-teal-700 dark:text-teal-400 font-mono">
            PKR {(paidRevenuePKR / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 })}M
          </div>
          <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            From settled transactions
          </div>
        </div>
      </div>

      {/* 2-Column Split: Provincial Spread & Curriculum Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Provincial Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>Provincial Campus Distribution</span>
            </h3>
            <span className="text-xs text-slate-400">All Pakistan</span>
          </div>

          <div className="space-y-3">
            {Object.entries(provinceCounts).map(([prov, count]) => {
              const pct = Math.round((count / schools.length) * 100);
              return (
                <div key={prov} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{prov}</span>
                    <span className="text-teal-600 font-mono">{count} Campuses ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Curriculum Distribution */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-teal-600" />
              <span>Students by Curriculum Standard</span>
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(curriculumCounts).map(([curr, count]) => {
              const pct = Math.round((count / totalStudents) * 100);
              return (
                <div key={curr} className="space-y-1 text-xs">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-800 dark:text-slate-200">{curr}</span>
                    <span className="text-blue-600 dark:text-blue-400 font-mono">{count.toLocaleString()} Students ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
