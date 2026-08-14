import React, { useState } from 'react';
import { 
  Layers, 
  X, 
  Check, 
  ArrowRight, 
  Percent, 
  Calendar, 
  CreditCard, 
  AlertTriangle, 
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SchoolTenant, SubscriptionPlan, SubscriptionCycle } from '../../types/superAdmin';

interface SubscriptionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  school: SchoolTenant | null;
  plans: SubscriptionPlan[];
  onSaveSubscription: (schoolId: string, updatedData: {
    planId: string;
    planName: SchoolTenant['planName'];
    billingCycle: SubscriptionCycle;
    monthlyFeePKR: number;
    annualFeePKR: number;
    trialEndsAt?: string;
  }) => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  isOpen,
  onClose,
  school,
  plans,
  onSaveSubscription
}) => {
  if (!isOpen || !school) return null;

  const [selectedPlanId, setSelectedPlanId] = useState(school.planId);
  const [billingCycle, setBillingCycle] = useState<SubscriptionCycle>(school.billingCycle);
  const [discountPct, setDiscountPct] = useState(0);
  const [extendTrialDays, setExtendTrialDays] = useState(0);

  const currentPlan = plans.find(p => p.id === selectedPlanId) || plans[0];

  const calculatedMonthly = Math.round(currentPlan.monthlyPricePKR * (1 - discountPct / 100));
  const calculatedAnnual = Math.round(currentPlan.annualPricePKR * (1 - discountPct / 100));

  const handleSave = () => {
    onSaveSubscription(school.id, {
      planId: currentPlan.id,
      planName: currentPlan.name as any,
      billingCycle,
      monthlyFeePKR: calculatedMonthly,
      annualFeePKR: calculatedAnnual,
      trialEndsAt: extendTrialDays > 0 ? new Date(Date.now() + extendTrialDays * 86400000).toISOString().split('T')[0] : undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Modify Subscription Tier
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {school.name} ({school.code})
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs font-medium max-h-[60vh] overflow-y-auto">
          {/* Plan Choice */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Select Package Tier
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              {plans.map((p) => {
                const isSelected = selectedPlanId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedPlanId(p.id)}
                    className={`p-3 rounded-2xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-teal-600 bg-teal-50/60 dark:bg-teal-950/50'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex justify-between">
                      <span>{p.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-teal-600" />}
                    </div>
                    <div className="font-mono text-teal-700 dark:text-teal-400 font-bold mt-1 text-[11px]">
                      PKR {p.monthlyPricePKR.toLocaleString()} /mo
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      {p.maxStudents.toLocaleString()} Students • {p.storageGB} GB
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Billing Cycle */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Billing Cycle
              </label>
              <select
                value={billingCycle}
                onChange={(e) => setBillingCycle(e.target.value as any)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="annual">Annual (Billed Yearly)</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>Special Promo Discount</span>
                <span className="font-mono text-teal-600">{discountPct}%</span>
              </label>
              <select
                value={discountPct}
                onChange={(e) => setDiscountPct(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value={0}>No Discount (0%)</option>
                <option value={10}>10% Special Education Discount</option>
                <option value={20}>20% Multi-Campus Chain Discount</option>
                <option value={30}>30% Government / Non-Profit Subsidy</option>
              </select>
            </div>
          </div>

          {/* Trial extension if on trial */}
          {school.status === 'Trial' && (
            <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-1.5">
              <div className="font-bold text-blue-900 dark:text-blue-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Extend Active Trial</span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                Current Trial Ends: <span className="font-mono font-bold">{school.trialEndsAt || school.nextBillingDate}</span>
              </p>
              <select
                value={extendTrialDays}
                onChange={(e) => setExtendTrialDays(Number(e.target.value))}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 rounded-xl text-xs font-semibold mt-1"
              >
                <option value={0}>Do not extend</option>
                <option value={7}>Extend by +7 Days</option>
                <option value={14}>Extend by +14 Days</option>
                <option value={30}>Extend by +30 Days</option>
              </select>
            </div>
          )}

          {/* Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Effective Recurring Fee:</span>
              <span className="font-mono text-slate-900 dark:text-white font-black text-sm">
                PKR {calculatedMonthly.toLocaleString()} <span className="text-[10px] font-normal text-slate-400">/month</span>
              </span>
            </div>
            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">
              <span>Annual Settlement Price:</span>
              <span>PKR {calculatedAnnual.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20"
          >
            Update Subscription
          </button>
        </div>
      </div>
    </div>
  );
};
