import React, { useState } from 'react';
import { 
  Building2, 
  X, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  UserCheck, 
  Layers, 
  Settings, 
  Sparkles, 
  Mail, 
  Phone, 
  MapPin, 
  Key, 
  ShieldCheck, 
  Copy, 
  CheckCircle2,
  Send,
  ExternalLink
} from 'lucide-react';
import { SchoolTenant, SubscriptionPlan } from '../../types/superAdmin';

interface AddSchoolWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  plans: SubscriptionPlan[];
  onSchoolCreated: (newSchool: SchoolTenant) => void;
}

export const AddSchoolWizardModal: React.FC<AddSchoolWizardModalProps> = ({
  isOpen,
  onClose,
  plans,
  onSchoolCreated
}) => {
  const [step, setStep] = useState<number>(1);
  const [isCopied, setIsCopied] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: School Info
    name: '',
    code: '',
    type: 'Private School' as SchoolTenant['type'],
    address: '',
    city: 'Lahore',
    province: 'Punjab' as SchoolTenant['province'],
    phone: '+92 42 ',
    email: '',
    website: '',
    logo: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=120&auto=format&fit=crop&q=80',
    // Step 2: Principal
    principalName: '',
    principalEmail: '',
    principalPhone: '+92 300 ',
    initialPassword: 'Taleem#' + Math.floor(1000 + Math.random() * 9000),
    // Step 3: Subscription
    planId: 'plan-professional',
    billingCycle: 'annual' as SchoolTenant['billingCycle'],
    trialDays: 14,
    discountPKR: 0,
    // Step 4: Academic
    academicSystem: 'National Matric / FSc' as SchoolTenant['academicSystem'],
    gradingSystem: 'Percentage (Board)' as SchoolTenant['gradingSystem'],
    timezone: 'Asia/Karachi',
    smsMask: 'TALEEM-LMS'
  });

  if (!isOpen) return null;

  const selectedPlan = plans.find(p => p.id === formData.planId) || plans[1];

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else if (step === 4) {
      // Create school
      const newSchool: SchoolTenant = {
        id: `sch-${Date.now().toString().slice(-4)}`,
        code: formData.code || `SCH-${formData.city.substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`,
        name: formData.name || 'New Educational Institute',
        logo: formData.logo,
        type: formData.type,
        address: formData.address || 'Main Campus Boulevard',
        city: formData.city,
        province: formData.province,
        phone: formData.phone,
        email: formData.email || `admin@${formData.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.pk`,
        website: formData.website || `https://${formData.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.pk`,
        principalName: formData.principalName || 'Prof. Administrator',
        principalEmail: formData.principalEmail || `principal@${formData.name.toLowerCase().replace(/[^a-z]/g, '')}.edu.pk`,
        principalPhone: formData.principalPhone,
        planId: selectedPlan.id,
        planName: selectedPlan.name as any,
        billingCycle: formData.billingCycle,
        status: 'Active',
        studentCount: 120,
        maxStudents: selectedPlan.maxStudents,
        teacherCount: 12,
        maxTeachers: selectedPlan.maxTeachers,
        staffCount: 5,
        parentCount: 110,
        coursesCount: 15,
        maxCourses: selectedPlan.maxCourses,
        storageUsedGB: 5.0,
        storageLimitGB: selectedPlan.storageGB,
        monthlyFeePKR: selectedPlan.monthlyPricePKR,
        annualFeePKR: selectedPlan.annualPricePKR,
        nextBillingDate: '2027-08-14',
        createdDate: new Date().toISOString().split('T')[0],
        lastActive: 'Just now',
        academicSystem: formData.academicSystem,
        gradingSystem: formData.gradingSystem,
        timezone: 'Asia/Karachi',
        currency: 'PKR'
      };

      onSchoolCreated(newSchool);
      setStep(5); // Success step
    }
  };

  const handleCopyCredentials = () => {
    const creds = `TaleemLM School Portal Access:\nSchool: ${formData.name}\nPortal URL: https://portal.taleemlms.com.pk\nPrincipal Email: ${formData.principalEmail}\nTemporary Password: ${formData.initialPassword}`;
    navigator.clipboard.writeText(creds);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const handleSendWelcome = () => {
    setIsEmailSent(true);
    setTimeout(() => setIsEmailSent(false), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden z-10 animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {step === 5 ? 'Campus Provisioned Successfully!' : 'Onboard New School Tenant'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {step === 5 ? 'Access credentials generated & ready for dispatch' : `Step ${step} of 4: Setup parameters & tenant isolation`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Progress Indicators */}
        {step <= 4 && (
          <div className="px-6 pt-4 pb-2 flex items-center justify-between">
            {[
              { num: 1, label: 'Institute' },
              { num: 2, label: 'Principal' },
              { num: 3, label: 'Subscription' },
              { num: 4, label: 'Academics' }
            ].map((s) => (
              <div key={s.num} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-teal-600 text-white ring-4 ring-teal-500/20 shadow-xs'
                    : step > s.num
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }`}>
                  {step > s.num ? <Check className="w-3.5 h-3.5" /> : s.num}
                </div>
                <span className={`text-xs font-semibold hidden sm:inline ${
                  step === s.num ? 'text-slate-900 dark:text-white' : 'text-slate-400'
                }`}>
                  {s.label}
                </span>
                {s.num < 4 && <div className="w-8 h-px bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />}
              </div>
            ))}
          </div>
        )}

        {/* Step Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4 text-xs font-medium">
          {/* STEP 1: School Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Institute / School Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Lahore Grammar School (Defence Campus)"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus ID Code (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. LGS-LHE-04"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Institution Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Private School">Private School</option>
                    <option value="College">College / Higher Secondary</option>
                    <option value="Cadet College">Cadet College / Military</option>
                    <option value="O/A Levels Academy">Cambridge O/A Levels Academy</option>
                    <option value="Islamic Institute">Islamic Institute / Madrassa</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    City (Pakistan) *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Province / Region *
                  </label>
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KPK)</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                    <option value="Azad Kashmir">Azad Kashmir</option>
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Campus Physical Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. 15-K, Phase 5, DHA"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Principal / Admin */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-3.5 bg-teal-50 dark:bg-teal-950/40 rounded-2xl border border-teal-200/60 dark:border-teal-900/60 text-xs text-teal-900 dark:text-teal-200">
                This administrator will receive primary credentials and full control over this school tenant portal.
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Principal / Headmaster Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.principalName}
                    onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                    placeholder="e.g. Dr. Salman Qazi"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Principal Official Email Address *
                  </label>
                  <input
                    type="email"
                    value={formData.principalEmail}
                    onChange={(e) => setFormData({ ...formData, principalEmail: e.target.value })}
                    placeholder="e.g. principal@school.edu.pk"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Principal WhatsApp / Mobile (+92) *
                  </label>
                  <input
                    type="text"
                    value={formData.principalPhone}
                    onChange={(e) => setFormData({ ...formData, principalPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Generated Temporary Password
                  </label>
                  <input
                    type="text"
                    value={formData.initialPassword}
                    onChange={(e) => setFormData({ ...formData, initialPassword: e.target.value })}
                    className="w-full p-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-teal-700 dark:text-teal-300"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Subscription */}
          {step === 3 && (
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                Select SaaS Plan Tier
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {plans.map((plan) => {
                  const isSelected = formData.planId === plan.id;
                  return (
                    <div
                      key={plan.id}
                      onClick={() => setFormData({ ...formData, planId: plan.id })}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-teal-600 bg-teal-50/50 dark:bg-teal-950/40 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {plan.name}
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-teal-600" />}
                      </div>
                      <div className="text-xs font-mono font-bold text-teal-700 dark:text-teal-400 mt-1">
                        PKR {plan.monthlyPricePKR.toLocaleString()} /mo
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 space-y-0.5">
                        <div>• Up to {plan.maxStudents.toLocaleString()} Students</div>
                        <div>• {plan.storageGB} GB Cloud Storage</div>
                        <div>• {plan.supportLevel}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Billing Cycle
                  </label>
                  <select
                    value={formData.billingCycle}
                    onChange={(e) => setFormData({ ...formData, billingCycle: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="annual">Annual Billing (10% Discount)</option>
                    <option value="monthly">Monthly Billing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Trial Period
                  </label>
                  <select
                    value={formData.trialDays}
                    onChange={(e) => setFormData({ ...formData, trialDays: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value={14}>14 Days Free Trial</option>
                    <option value={30}>30 Days Free Trial</option>
                    <option value={0}>No Trial (Activate & Bill Instantly)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Academics */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    National / International Curriculum Standard
                  </label>
                  <select
                    value={formData.academicSystem}
                    onChange={(e) => setFormData({ ...formData, academicSystem: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="National Matric / FSc">National Matric / FSc (Punjab / Sindh / KPK / Balochistan Boards)</option>
                    <option value="Federal Board (FBISE)">Federal Board of Intermediate and Secondary Education (FBISE)</option>
                    <option value="Cambridge (O/A Levels)">Cambridge Assessment International Education (CAIE O/A Levels)</option>
                    <option value="IB World">International Baccalaureate (IB)</option>
                    <option value="Dars-e-Nizami">Dars-e-Nizami / Wafaq-ul-Madaris</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Grading & Assessment Standard
                  </label>
                  <select
                    value={formData.gradingSystem}
                    onChange={(e) => setFormData({ ...formData, gradingSystem: e.target.value as any })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    <option value="Percentage (Board)">Percentage & Position (Standard Pakistani Board)</option>
                    <option value="GPA 4.0">GPA 4.0 Grading Scale</option>
                    <option value="Cambridge (A*-U)">Cambridge Letter Grades (A* to U)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Branded SMS Mask for Attendance & Fee Receipts
                  </label>
                  <input
                    type="text"
                    value={formData.smsMask}
                    onChange={(e) => setFormData({ ...formData, smsMask: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-teal-700 dark:text-teal-300"
                  />
                  <span className="text-[10px] text-slate-400">PTA approved sender identity mask for telco routing</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Success & Credentials Dispatch */}
          {step === 5 && (
            <div className="space-y-4 py-2 text-center">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {formData.name || 'New Campus'} is Ready!
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Tenant partition created, isolated schema initialized, and principal account provisioned.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Portal Login URL:</span>
                  <span className="font-mono text-teal-600 dark:text-teal-400 font-bold">https://portal.taleemlms.com.pk</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Principal Login ID:</span>
                  <span className="font-mono text-slate-900 dark:text-white font-bold">{formData.principalEmail || 'principal@school.edu.pk'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Temporary Password:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{formData.initialPassword}</span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={handleCopyCredentials}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                  <span>{isCopied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
                </button>

                <button
                  onClick={handleSendWelcome}
                  className="px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-teal-600/20 transition-all cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{isEmailSent ? 'Email & SMS Dispatched!' : 'Send Welcome Email & SMS'}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          {step <= 4 ? (
            <>
              <button
                type="button"
                onClick={() => (step === 1 ? onClose() : setStep(step - 1))}
                className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 font-semibold text-xs transition-colors"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>{step === 4 ? 'Provision Campus Now' : 'Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs transition-colors"
            >
              Done & Return to Schools Directory
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
