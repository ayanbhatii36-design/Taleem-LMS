import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, FastForward, KeyRound, Loader2 } from 'lucide-react';
import { UserRole } from '../../types';
import { AuthUser, clearSession, storeSession } from '../../api/client';
import { authApi } from '../../api/auth';
import { isBackendReachable, invalidateReachability } from '../../api/useApi';

interface LoginModalProps {
  isOpen?: boolean;
  initialRole?: UserRole;
  onClose: () => void;
  onLoginSuccess: (role: UserRole, user?: AuthUser) => void;
}

const ROLE_PRESETS: Record<UserRole, { email: string; password: string }> = {
  principal: { email: 'principal@imcb.edu.pk', password: 'Pass1234' },
  teacher: { email: 'teacher@imcb.edu.pk', password: 'Pass1234' },
  student: { email: 'student@imcb.edu.pk', password: 'Pass1234' },
  parent: { email: 'parent@imcb.edu.pk', password: 'Pass1234' }
};

function mapBackendRole(role: string): UserRole {
  if (role === 'teacher') return 'teacher';
  if (role === 'student') return 'student';
  if (role === 'parent') return 'parent';
  return 'principal';
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen = true,
  initialRole = 'principal',
  onClose,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [email, setEmail] = useState(ROLE_PRESETS[initialRole].email);
  const [password, setPassword] = useState(ROLE_PRESETS[initialRole].password);
  const [step, setStep] = useState<'credentials' | '2fa'>('credentials');
  const [twoFactorCode, setTwoFactorCode] = useState('582910');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCloseModal = () => {
    setStep('credentials');
    setErrorMsg(null);
    onClose();
  };

  const selectRole = (r: UserRole) => {
    setRole(r);
    setEmail(ROLE_PRESETS[r].email);
    setPassword(ROLE_PRESETS[r].password);
    setErrorMsg(null);
  };

  const completeLogin = (mappedRole: UserRole, backendUser?: AuthUser) => {
    setStep('credentials');
    setErrorMsg(null);
    onLoginSuccess(mappedRole, backendUser);
  };

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const reachable = await isBackendReachable();
      if (!reachable) {
        // Backend offline → demo fallback (bypass 2FA, enter portal directly)
        clearSession();
        setLoading(false);
        completeLogin(role);
        return;
      }

      const result = await authApi.login(email.trim(), password);
      storeSession(result.token, result.refreshToken, result.user);
      invalidateReachability();
      setLoading(false);
      setStep('2fa'); // demo 2FA step, credentials already verified
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Login failed. Please check your credentials.');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    completeLogin(role);
  };

  const handleBypass2FA = () => {
    completeLogin(role);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={handleCloseModal} />
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white text-sm">
              T
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Portal Secure Sign-In</h3>
              <p className="text-[10px] text-slate-400">TaleemLMS — Authenticated via Backend API</p>
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
                    onClick={() => selectRole(r)}
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
                <label className="font-bold text-slate-700 dark:text-slate-300">Email or Phone</label>
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

            {errorMsg && (
              <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-2.5">
                {errorMsg}
              </p>
            )}

            <div className="space-y-2 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                <span>{loading ? 'Verifying credentials…' : 'Continue to 2FA Step'}</span>
              </button>

              <button
                type="button"
                onClick={handleBypass2FA}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <FastForward className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>Skip Login & Open Demo Interface</span>
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
                Enter the 6-digit SMS code sent to your registered phone
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