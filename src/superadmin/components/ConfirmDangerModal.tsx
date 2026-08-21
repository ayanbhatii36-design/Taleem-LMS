import React, { useState } from 'react';
import { AlertTriangle, Lock, ShieldAlert, X } from 'lucide-react';

interface ConfirmDangerModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  expectedInput?: string; // e.g., "DELETE SCHOOL" or school name
  requiredConfirmationWord?: string;
  requiredWord?: string;
  dangerLevel?: 'warning' | 'danger' | 'critical';
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const ConfirmDangerModal: React.FC<ConfirmDangerModalProps> = ({
  isOpen,
  title,
  description,
  confirmText = 'Confirm Dangerous Action',
  expectedInput,
  requiredConfirmationWord,
  requiredWord,
  dangerLevel = 'danger',
  onConfirm,
  onClose,
  isLoading = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [requiresPassword, setRequiresPassword] = useState(dangerLevel === 'critical');

  if (!isOpen) return null;

  const targetExpected = expectedInput || requiredConfirmationWord || requiredWord;
  const isInputValid = targetExpected ? inputValue.trim().toLowerCase() === targetExpected.trim().toLowerCase() : true;
  const isPasswordValid = requiresPassword ? passwordValue.length >= 4 : true;
  const canSubmit = isInputValid && isPasswordValid && !isLoading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-red-200 dark:border-red-900/40 p-6 z-10 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              dangerLevel === 'critical' 
                ? 'bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20' 
                : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
            }`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {title}
              </h3>
              <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                {dangerLevel === 'critical' ? 'High Risk Super Admin Operation' : 'Action Requires Authorization'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/80 dark:border-red-900/50 text-xs text-red-900 dark:text-red-200 leading-relaxed">
            {description}
          </div>

          {targetExpected && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                To confirm, type <span className="font-mono font-bold text-red-600 dark:text-red-400 px-1 py-0.5 rounded bg-red-100 dark:bg-red-950/50">{targetExpected}</span> below:
              </label>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Type "${targetExpected}"`}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                autoFocus
              />
            </div>
          )}

          {requiresPassword && (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Super Admin Password Confirmation</span>
                <span className="text-[10px] text-slate-400">Security Requirement</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="password"
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  placeholder="Enter your Super Admin password"
                  className="w-full pl-9 p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 ${
                canSubmit
                  ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/20'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{isLoading ? 'Processing...' : confirmText}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
