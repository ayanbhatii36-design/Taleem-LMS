import React, { useState } from 'react';
import { Shield, Lock, User, Phone, CheckCircle2, ArrowRight, KeyRound, Sparkles, FastForward } from 'lucide-react';
import { UserRole } from '../../types';

interface LoginModalProps {
  isOpen?: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onLoginSuccess: (role: UserRole) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  initialRole = 'principal',
  onClose,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState('principal@islamabadcollege.edu.pk');
  const [password, setPassword] = useState('••••••••••••');
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState('582910');

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setStep('credentials');
    onClose();
  };

  const handleSubmitCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('2fa');
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('credentials');
    onLoginSuccess(role);
  };

  const handleBypass2FA = () => {
    setStep('credentials');
    onLoginSuccess(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-sm">
              T
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Portal Secure Sign-In</h3>
              <p className="text-[10px] text-slate-400">Pakistani Educational Institution Login</p>
            </div>
          </div>
          <button onClick={handleCloseModal} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800">✕</button>
        </div>

        {step === 'credentials' ? (
          <form onSubmit={handleSubmitCredentials} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Login Role</label>
              <div className="grid grid-cols-2 gap-2 mt-1.5">
                {(['principal', 'teacher', 'student', 'parent'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => {
                      setRole(r);
                      if (r === 'principal') setEmail('principal@islamabadcollege.edu.pk');
                      if (r === 'teacher') setEmail('farooq.physics@islamabadcollege.edu.pk');
                      if (r === 'student') setEmail('zainab.student@islamabadcollege.edu.pk');
                      if (r === 'parent') setEmail('tariq.guardian@gmail.com');
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-bold capitalize transition-all ${
                      role === r
                        ? 'bg-teal-700 text-white border-teal-700 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Email or Registration ID</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2"
              >
                <span>Continue to 2FA Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleBypass2FA}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <FastForward className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Bypass 2FA & Direct Access to Interface</span>
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify2FA} className="space-y-4">
            <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-xs space-y-1">
              <p className="font-bold text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-teal-600" />
                Two-Factor Security Verification
              </p>
              <p className="text-slate-600 dark:text-slate-300 text-[11px]">
                Enter the 6-digit SMS code sent to <span className="font-semibold">+92 300 5551234</span>
              </p>
              <p className="text-[10px] text-teal-700 dark:text-teal-300 font-medium">
                (Demo code auto-filled: <span className="font-bold">582910</span>)
              </p>
            </div>

            <div>
              <input
                type="text"
                required
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="w-full p-3 text-center text-lg font-mono font-black tracking-widest bg-slate-50 dark:bg-slate-800 border rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Verify & Enter Portal</span>
              </button>

              <button
                type="button"
                onClick={handleBypass2FA}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <FastForward className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Skip 2FA & Open Website Interface Now</span>
              </button>

              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
              >
                ← Back to Login Credentials
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
