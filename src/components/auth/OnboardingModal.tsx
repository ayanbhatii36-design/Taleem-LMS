import React, { useState } from 'react';
import { UserCheck, Sparkles, CheckCircle2, Phone, Building2 } from 'lucide-react';
import { UserRole } from '../../types';

interface OnboardingModalProps {
  role: UserRole;
  onComplete: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ role, onComplete }) => {
  const [fullName, setFullName] = useState('Prof. Sajjad Ali');
  const [cnic, setCnic] = useState('61101-2345678-9');
  const [phone, setPhone] = useState('+92 300 5551234');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-teal-600" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Profile Verification & Onboarding</h3>
        </div>
        <p className="text-xs text-slate-500">
          Complete mandatory institute registry requirements for {role.toUpperCase()} access.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">CNIC / B-Form</label>
            <input
              type="text"
              required
              value={cnic}
              onChange={(e) => setCnic(e.target.value)}
              className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300">Phone (+92)</label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all mt-4"
          >
            Complete Onboarding & Enter Portal
          </button>
        </form>
      </div>
    </div>
  );
};
