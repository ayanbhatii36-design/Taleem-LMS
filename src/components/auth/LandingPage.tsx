import React from 'react';
import {
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Users,
  Building2,
  BookOpen,
  ArrowRight,
  Sparkles,
  Award,
  Calendar,
  CreditCard,
  MessageSquare
} from 'lucide-react';
import { UserRole, InstituteInfo } from '../../types';

interface LandingPageProps {
  onOpenLogin: (role?: UserRole) => void;
  onQuickDemo: (role: UserRole) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenLogin, onQuickDemo }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-teal-500 selection:text-white">
      {/* Background Accent Gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-teal-500/10 via-blue-600/5 to-transparent blur-3xl pointer-events-none" />

      {/* Navigation Header */}
      <header className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-600 flex items-center justify-center font-black text-white shadow-lg shadow-teal-600/30">
            T
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-white">Taleem<span className="text-teal-400">LMS</span></span>
            <p className="text-[10px] text-slate-400 font-medium">Pakistan Institute Platform</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onOpenLogin()}
            className="px-5 py-2.5 rounded-xl bg-teal-700 hover:bg-teal-600 text-white font-bold text-xs shadow-lg shadow-teal-700/20 transition-all"
          >
            Sign In to Portal
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-16 pb-20 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-950/80 border border-teal-500/30 text-teal-300 text-xs font-semibold backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span>Tailored specifically for Schools, Colleges & Academies in Pakistan</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white leading-tight">
          Modern Institute Management & <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-teal-400 via-emerald-300 to-blue-400 bg-clip-text text-transparent">
            Student Learning Platform
          </span>
        </h1>

        <p className="text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Unifying Principals, Educators, Students, and Parents into a single, high-performance ecosystem. Built for FBISE, Cambridge, and Regional Boards.
        </p>

        {/* Quick Demo Launchers */}
        <div className="pt-6 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Select a Role to Experience Live Interactive Dashboard
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => onQuickDemo('principal')}
              className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-teal-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all group"
            >
              <Building2 className="w-4 h-4 text-teal-400" />
              <span>Principal Command Center</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400" />
            </button>

            <button
              onClick={() => onQuickDemo('teacher')}
              className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-blue-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all group"
            >
              <Users className="w-4 h-4 text-blue-400" />
              <span>Teacher Workspace</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400" />
            </button>

            <button
              onClick={() => onQuickDemo('student')}
              className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-emerald-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all group"
            >
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Student Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400" />
            </button>

            <button
              onClick={() => onQuickDemo('parent')}
              className="px-5 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-white font-bold text-xs flex items-center gap-2 hover:bg-slate-800 transition-all group"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Parent Portal</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-slate-400" />
            </button>
          </div>
        </div>
      </section>

      {/* Key Feature Highlights */}
      <section className="max-w-7xl mx-auto px-6 py-12 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-950 text-teal-400 flex items-center justify-center font-bold">
            <CreditCard className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">PKR Fee & Billing</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Monthly vouchers, sibling discounts, and direct integration with EasyPaisa, JazzCash, and 1Link banks.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">FBISE & GPA Grading</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Configurable marksheets matching Pakistani board exam patterns, 4.0 GPA, and Cambridge scales.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center font-bold">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Conflict-Free Timetables</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Automated double-booking detection for classrooms and educators across primary and higher secondary blocks.
          </p>
        </div>
      </section>
    </div>
  );
};
