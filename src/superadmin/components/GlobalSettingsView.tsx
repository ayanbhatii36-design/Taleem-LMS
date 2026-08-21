import React, { useEffect, useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  MessageSquare, 
  Save, 
  Check 
} from 'lucide-react';
import { PlatformSettings } from '../types';

interface GlobalSettingsViewProps {
  settings: PlatformSettings;
  onSaveSettings: (newSettings: PlatformSettings) => void;
}

export const GlobalSettingsView: React.FC<GlobalSettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings
}) => {
  const [settings, setSettings] = useState<PlatformSettings>(initialSettings);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const update = (patch: Partial<PlatformSettings>) => {
    setSettings({ ...settings, ...patch });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Global Platform Configuration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Root Level
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage company identity, payment gateway credentials, SMS gateway provider, and platform-wide security defaults.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Settings Saved Successfully!' : 'Save System Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Company Profile */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            <span>SaaS Provider Legal Entity (Pakistan)</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Platform / SaaS Brand Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => update({ companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Billing Currency</label>
              <select
                value={settings.billingCurrency}
                onChange={(e) => update({ billingCurrency: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl cursor-pointer"
              >
                <option value="PKR">PKR (Pakistani Rupee)</option>
                <option value="USD">USD (US Dollar)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Official Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => update({ supportEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">National Support Hotline (+92)</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => update({ supportPhone: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Payment Gateways & Banking */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span>Pakistani Payment Gateway Connectors</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">1Link 1Bill Biller Code</label>
              <input
                type="text"
                value={settings.oneLinkBillerCode}
                onChange={(e) => update({ oneLinkBillerCode: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-teal-700 dark:text-teal-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">JazzCash Merchant ID</label>
              <input
                type="text"
                value={settings.jazzCashMerchantId}
                onChange={(e) => update({ jazzCashMerchantId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">EasyPaisa Store ID</label>
              <input
                type="text"
                value={settings.easyPaisaStoreId}
                onChange={(e) => update({ easyPaisaStoreId: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Stripe Public Key</label>
              <input
                type="text"
                value={settings.stripePublicKey}
                onChange={(e) => update({ stripePublicKey: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Telecommunications & PTA SMS Mask */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-teal-600" />
            <span>PTA SMS Gateway & Telco Masking</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">SMS Gateway Provider</label>
              <select
                value={settings.smsGatewayProvider}
                onChange={(e) => update({ smsGatewayProvider: e.target.value as any })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold cursor-pointer"
              >
                <option value="Telenor SMS Pro">Telenor SMS Pro</option>
                <option value="Jazz SMS Connect">Jazz SMS Connect</option>
                <option value="Zong Enterprise">Zong Enterprise</option>
                <option value="Twilio">Twilio</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Default Trial Period (Days)</label>
              <input
                type="number"
                min={0}
                value={settings.defaultTrialDays}
                onChange={(e) => update({ defaultTrialDays: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Security & Platform Defaults */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Super Admin Security & Access Rules</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">Enforce Two-Factor Authentication (2FA)</div>
                <div className="text-slate-400 text-[11px]">Mandatory for all internal Super Admin personnel</div>
              </div>
              <input
                type="checkbox"
                checked={settings.twoFactorEnforced}
                onChange={(e) => update({ twoFactorEnforced: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">Allow Self Registration</div>
                <div className="text-slate-400 text-[11px]">Schools can request onboarding without super admin invite</div>
              </div>
              <input
                type="checkbox"
                checked={settings.allowSelfRegistration}
                onChange={(e) => update({ allowSelfRegistration: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">Automatic Invoice Generation</div>
                <div className="text-slate-400 text-[11px]">Generate PKR invoices on billing cycle renewal</div>
              </div>
              <input
                type="checkbox"
                checked={settings.autoInvoicing}
                onChange={(e) => update({ autoInvoicing: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">WhatsApp API Enabled</div>
                <div className="text-slate-400 text-[11px]">Use WhatsApp Business API for parent & school alerts</div>
              </div>
              <input
                type="checkbox"
                checked={settings.whatsappApiEnabled}
                onChange={(e) => update({ whatsappApiEnabled: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div className="min-w-0">
                <div className="font-bold text-slate-900 dark:text-white">Maintenance Mode</div>
                <div className="text-slate-400 text-[11px]">Block school logins with a maintenance screen</div>
              </div>
              <input
                type="checkbox"
                checked={settings.maintenanceMode}
                onChange={(e) => update({ maintenanceMode: e.target.checked })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer shrink-0"
              />
            </div>

            <div className="space-y-1.5 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <label className="text-slate-700 dark:text-slate-300 font-bold block">Backup Frequency</label>
              <select
                value={settings.backupFrequency}
                onChange={(e) => update({ backupFrequency: e.target.value as any })}
                className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                <option value="Daily (03:00 AM PKT)">Daily (03:00 AM PKT)</option>
                <option value="Hourly">Hourly</option>
                <option value="Weekly">Weekly</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
