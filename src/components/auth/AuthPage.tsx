import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
  KeyRound,
  CheckCircle2,
  Loader2,
  FastForward,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Sparkles
} from 'lucide-react';
import { UserRole } from '../../types';
import { AuthUser, clearSession, storeSession } from '../../api/client';
import { authApi } from '../../api/auth';
import { isBackendReachable, invalidateReachability } from '../../api/useApi';

interface AuthPageProps {
  initialRole?: UserRole;
  initialMode?: 'signin' | 'signup';
  onBack: () => void;
  onLoginSuccess: (role: UserRole, user?: AuthUser) => void;
}

type Mode = 'signin' | 'signup';

const ROLE_META: Record<
  UserRole,
  { icon: React.ElementType; accent: string; gradient: string; title: string; subtitle: string }
> = {
  principal: {
    icon: Building2,
    accent: 'text-teal-400',
    gradient: 'from-teal-700 to-emerald-700',
    title: 'Principal / Admin Portal',
    subtitle: 'Command center for your institute'
  },
  teacher: {
    icon: Users,
    accent: 'text-blue-400',
    gradient: 'from-blue-700 to-indigo-700',
    title: 'Faculty & Teacher Portal',
    subtitle: 'Classes, assignments & attendance'
  },
  student: {
    icon: GraduationCap,
    accent: 'text-emerald-400',
    gradient: 'from-emerald-700 to-teal-700',
    title: 'Student Portal',
    subtitle: 'Courses, exams & results'
  },
  parent: {
    icon: ShieldCheck,
    accent: 'text-amber-400',
    gradient: 'from-amber-600 to-orange-700',
    title: 'Parent Guardian Portal',
    subtitle: 'Track your child’s progress'
  }
};

const ROLES: UserRole[] = ['principal', 'teacher', 'student', 'parent'];

const DEMO_CREDS: Record<UserRole, { email: string; password: string }> = {
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

const inputCls =
  'w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/50';

const labelCls = 'text-xs font-bold text-slate-700 dark:text-slate-300';

export const AuthPage: React.FC<AuthPageProps> = ({
  initialRole = 'principal',
  initialMode = 'signin',
  onBack,
  onLoginSuccess
}) => {
  const [role, setRole] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [step, setStep] = useState<'form' | '2fa'>('form');
  const [twoFactorCode, setTwoFactorCode] = useState('582910');
  const [pendingBackendUser, setPendingBackendUser] = useState<AuthUser | null>(null);

  // Sign In fields
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Sign Up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [designation, setDesignation] = useState('');
  const [qualification, setQualification] = useState('');
  const [guardianName, setGuardianName] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [dob, setDob] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const meta = ROLE_META[role];
  const RoleIcon = meta.icon;

  const switchRole = (r: UserRole) => {
    setRole(r);
    setErrorMsg(null);
    setStep('form');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep('form');
    setErrorMsg(null);
  };

  const completeLogin = (mappedRole: UserRole, backendUser?: AuthUser) => {
    setStep('form');
    setErrorMsg(null);
    onLoginSuccess(mappedRole, backendUser);
  };

  const handleDemoEntry = () => {
    clearSession();
    completeLogin(role);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const reachable = await isBackendReachable();
      if (!reachable) {
        clearSession();
        setLoading(false);
        completeLogin(role);
        return;
      }
      const result = await authApi.login(identifier.trim(), password);
      storeSession(result.token, result.refreshToken, result.user);
      invalidateReachability();
      setLoading(false);
      setPendingBackendUser(result.user);
      setStep('2fa');
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Sign in failed. Please check your credentials.');
    }
  };

  const handleVerify2FA = (e: React.FormEvent) => {
    e.preventDefault();
    const backendRole = pendingBackendUser ? mapBackendRole(pendingBackendUser.role) : role;
    completeLogin(backendRole, pendingBackendUser || undefined);
    setPendingBackendUser(null);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (signupPassword.length < 8) {
      setErrorMsg('Password must be at least 8 characters.');
      return;
    }
    if (signupPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (role === 'student' && !guardianName.trim()) {
      setErrorMsg('Please provide a guardian name.');
      return;
    }

    setLoading(true);
    try {
      const reachable = await isBackendReachable();
      if (!reachable) {
        setLoading(false);
        setErrorMsg('Backend is offline. Registration is unavailable in demo mode.');
        return;
      }
      const result = await authApi.register({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: signupPassword,
        role,
        designation: role === 'teacher' ? designation : undefined,
        qualification: role === 'teacher' ? qualification : undefined,
        guardian_name: role === 'student' ? guardianName : undefined,
        guardian_phone: role === 'student' ? guardianPhone : undefined,
        gender: role === 'student' ? gender : undefined,
        dob: role === 'student' ? dob : undefined
      });
      storeSession(result.token, result.refreshToken, result.user);
      invalidateReachability();
      setLoading(false);
      const backendRole = mapBackendRole(result.user.role);
      completeLogin(backendRole, result.user);
    } catch (err: any) {
      setLoading(false);
      setErrorMsg(err?.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Background Accent Gradients */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-teal-500/10 via-blue-600/5 to-transparent blur-3xl" />

      {/* Header */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between border-b border-slate-800/60">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-700 hover:border-teal-500 text-slate-300 hover:text-white font-semibold text-xs transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-black text-white shadow-lg shadow-teal-600/30">
            T
          </div>
          <div>
            <span className="text-base font-black tracking-tight">
              Taleem<span className="text-teal-400">LMS</span>
            </span>
            <p className="text-[10px] text-slate-400 font-medium">Secure Multi-Portal Access</p>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-6">
          {/* Left Brand Panel */}
          <div className={`hidden lg:flex flex-col justify-between p-8 rounded-3xl bg-gradient-to-br ${meta.gradient} shadow-2xl lg:col-span-2 min-h-[520px]`}>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-[11px] font-semibold backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                {meta.title}
              </div>
              <h1 className="text-3xl font-black tracking-tight mt-5 leading-tight">
                One account.
                <br />
                Your {role} dashboard.
              </h1>
              <p className="text-sm text-white/80 mt-3 leading-relaxed">
                {meta.subtitle}. Sign in to continue or create a new account to get started.
              </p>
            </div>

            <ul className="space-y-3 text-xs text-white/85">
              {[
                'Role-based permissions & secure JWT sessions',
                'Tailored dashboards for every portal',
                'Fee, attendance & academic insights in PKR'
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-3">
              <RoleIcon className="w-10 h-10 opacity-90" />
              <div className="text-xs text-white/70">
                <p className="font-bold text-white">{meta.title}</p>
                <p>TaleemLMS — Built for Pakistan Institutions</p>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 md:p-8">
            {/* Role Selector */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Select Portal
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {ROLES.map((r) => {
                  const Icon = ROLE_META[r].icon;
                  const active = role === r;
                  return (
                    <button
                      key={r}
                      type="button"
                      onClick={() => switchRole(r)}
                      className={`p-3 rounded-2xl border text-[11px] font-bold capitalize flex flex-col items-center gap-1.5 transition-all ${
                        active
                          ? `bg-gradient-to-br ${ROLE_META[r].gradient} text-white border-transparent shadow-md`
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? 'text-white' : ROLE_META[r].accent}`} />
                      {r}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Mode Tabs */}
            <div className="mt-6 grid grid-cols-2 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                type="button"
                onClick={() => switchMode('signin')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mode === 'signin'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => switchMode('signup')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  mode === 'signup'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                <UserPlus className="w-4 h-4" />
                Sign Up
              </button>
            </div>

            <div className="mt-6">
              {mode === 'signin' ? (
                step === 'form' ? (
                  <form onSubmit={handleSignIn} className="space-y-4">
                    <div className="space-y-3">
                      <div>
                        <label className={labelCls}>Email or Phone</label>
                        <input
                          type="text"
                          required
                          placeholder="you@institute.edu.pk"
                          value={identifier}
                          onChange={(e) => setIdentifier(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`${inputCls} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-2.5">
                        {errorMsg}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                      {loading ? 'Verifying credentials…' : 'Continue to 2FA Verification'}
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoEntry}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center gap-2"
                    >
                      <FastForward className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      Skip & Open Demo Interface
                    </button>

                    <div className="p-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                      <p className="font-bold text-teal-800 dark:text-teal-300">Demo accounts ({role})</p>
                      <p className="font-mono">
                        {DEMO_CREDS[role].email} <span className="text-slate-400">/</span> {DEMO_CREDS[role].password}
                      </p>
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

                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value)}
                      className="w-full p-3 text-center text-lg font-mono font-black tracking-widest bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl"
                    />

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Verify & Enter Portal
                    </button>

                    <button
                      type="button"
                      onClick={handleDemoEntry}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition-all"
                    >
                      Skip 2FA & Open Interface Now
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep('form')}
                      className="w-full text-center text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 py-1"
                    >
                      ← Back to Sign In
                    </button>
                  </form>
                )
              ) : (
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Full Name</label>
                      <input
                        type="text"
                        required
                        placeholder={role === 'parent' ? 'e.g. Rashid Ahmed' : 'e.g. Muhammad Usman'}
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className={inputCls}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Email</label>
                        <input
                          type="email"
                          required
                          placeholder="you@email.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Phone</label>
                        <input
                          type="tel"
                          required
                          placeholder="+92 3XX XXXXXXX"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>

                    {role === 'teacher' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Designation (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. Senior Lecturer"
                            value={designation}
                            onChange={(e) => setDesignation(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Qualification (optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. M.Phil Physics"
                            value={qualification}
                            onChange={(e) => setQualification(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}

                    {role === 'student' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className={labelCls}>Guardian Name</label>
                          <input
                            type="text"
                            required
                            placeholder="Guardian / parent name"
                            value={guardianName}
                            onChange={(e) => setGuardianName(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Guardian Phone</label>
                          <input
                            type="tel"
                            placeholder="+92 3XX XXXXXXX"
                            value={guardianPhone}
                            onChange={(e) => setGuardianPhone(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                        <div>
                          <label className={labelCls}>Gender</label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value as 'MALE' | 'FEMALE' | 'OTHER')}
                            className={inputCls}
                          >
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelCls}>Date of Birth</label>
                          <input
                            type="date"
                            value={dob}
                            onChange={(e) => setDob(e.target.value)}
                            className={inputCls}
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            placeholder="Min 8 characters"
                            value={signupPassword}
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className={`${inputCls} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className={labelCls}>Confirm Password</label>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          placeholder="Repeat password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className={inputCls}
                        />
                      </div>
                    </div>
                  </div>

                  {errorMsg && (
                    <p className="text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl p-2.5">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                    {loading ? 'Creating your account…' : `Create ${role} account`}
                  </button>

                  <p className="text-[11px] text-slate-400 text-center">
                    By signing up you agree to TaleemLMS terms of service. Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signin')}
                      className="text-teal-700 dark:text-teal-300 font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};