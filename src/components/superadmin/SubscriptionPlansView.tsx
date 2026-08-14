import React, { useState } from 'react';
import { 
  Layers, 
  Check, 
  Plus, 
  Edit3, 
  Users, 
  HardDrive, 
  Sparkles, 
  CreditCard, 
  ShieldCheck, 
  TrendingUp, 
  HelpCircle,
  X
} from 'lucide-react';
import { SubscriptionPlan, SchoolTenant } from '../../types/superAdmin';

interface SubscriptionPlansViewProps {
  plans: SubscriptionPlan[];
  schools: SchoolTenant[];
  onUpdatePlan: (updatedPlan: SubscriptionPlan) => void;
}

export const SubscriptionPlansView: React.FC<SubscriptionPlansViewProps> = ({
  plans,
  schools,
  onUpdatePlan
}) => {
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  // Calculate MRR per plan
  const planStats = plans.map(plan => {
    const subscribers = schools.filter(s => s.planName === plan.name && s.status === 'Active');
    const mrr = subscribers.reduce((acc, s) => acc + s.monthlyFeePKR, 0);
    return {
      ...plan,
      activeSchoolsCount: subscribers.length,
      totalMRR: mrr
    };
  });

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      onUpdatePlan(editingPlan);
      setEditingPlan(null);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Subscription Tiers & Pricing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {plans.length} Tier Levels
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure PKR billing rates, user caps, cloud storage limits, feature flags, and support SLAs.
          </p>
        </div>
      </div>

      {/* Plan Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {planStats.map((plan) => (
          <div
            key={plan.id}
            className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border flex flex-col justify-between transition-all relative ${
              plan.isPopular
                ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/5'
                : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
            }`}
          >
            {plan.isPopular && (
              <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                Most Popular Tier
              </span>
            )}

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {plan.name}
                </h3>
                <button
                  onClick={() => setEditingPlan(plan)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Plan"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1 min-h-[32px]">
                {plan.tagline}
              </p>

              {/* Pricing in PKR */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-bold text-slate-400">PKR</span>
                  <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                    {plan.monthlyPricePKR.toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <div className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 font-bold">
                  PKR {plan.annualPricePKR.toLocaleString()} / year (Billed Annually)
                </div>
              </div>

              {/* Key Limits */}
              <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">Max Students:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{plan.maxStudents.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">Max Teachers:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{plan.maxTeachers}</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">Cloud Storage:</span>
                  <span className="font-bold font-mono text-slate-900 dark:text-white">{plan.storageGB} GB</span>
                </div>
                <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                  <span className="text-slate-400">Support SLA:</span>
                  <span className="font-bold text-teal-700 dark:text-teal-300 truncate max-w-[120px]">{plan.supportLevel}</span>
                </div>
              </div>

              {/* Feature List */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Features Included</div>
                {plan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-slate-600 dark:text-slate-300 leading-tight">
                    <Check className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscriber stats */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Active Campuses:</span>
                <span className="font-bold text-slate-900 dark:text-white ml-1">{plan.activeSchoolsCount}</span>
              </div>
              <div className="font-mono font-bold text-teal-700 dark:text-teal-400 text-right">
                PKR {(plan.totalMRR / 1000000).toFixed(2)}M MRR
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Editor Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setEditingPlan(null)} />

          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-teal-600" />
                <span>Edit {editingPlan.name} Plan Parameters</span>
              </h3>
              <button onClick={() => setEditingPlan(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="mt-4 space-y-4 text-xs font-medium">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Monthly Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.monthlyPricePKR}
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthlyPricePKR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Annual Fee (PKR)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.annualPricePKR}
                    onChange={(e) => setEditingPlan({ ...editingPlan, annualPricePKR: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Student Enrollment Cap
                  </label>
                  <input
                    type="number"
                    value={editingPlan.maxStudents}
                    onChange={(e) => setEditingPlan({ ...editingPlan, maxStudents: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Storage Allocation (GB)
                  </label>
                  <input
                    type="number"
                    value={editingPlan.storageGB}
                    onChange={(e) => setEditingPlan({ ...editingPlan, storageGB: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md shadow-teal-600/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
