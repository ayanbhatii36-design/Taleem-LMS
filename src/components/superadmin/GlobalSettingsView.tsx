import React, { useState } from 'react';
import { 
  Settings, 
  Building2, 
  ShieldCheck, 
  CreditCard, 
  MessageSquare, 
  Save, 
  Check, 
  Key, 
  Lock, 
  Phone, 
  Mail, 
  Globe,
  Sparkles
} from 'lucide-react';
import { PlatformSettings } from '../../types/superAdmin';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
            Manage company entity legal identity, PTA SMS gateway credentials, 1Link API keys, and platform-wide security defaults.
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
                value={settings.platformName}
                onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Registered Legal Entity Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Official Support Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">National Support Hotline (+92)</label>
              <input
                type="text"
                value={settings.supportPhone}
                onChange={(e) => setSettings({ ...settings, supportPhone: e.target.value })}
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
              <label className="text-slate-700 dark:text-slate-300 font-bold">1Link 1Bill Biller ID</label>
              <input
                type="text"
                value={settings.paymentGateways.oneLinkBillerId}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentGateways: { ...settings.paymentGateways, oneLinkBillerId: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-teal-700 dark:text-teal-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">JazzCash Merchant ID</label>
              <input
                type="text"
                value={settings.paymentGateways.jazzCashMerchantId}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentGateways: { ...settings.paymentGateways, jazzCashMerchantId: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">EasyPaisa Store ID</label>
              <input
                type="text"
                value={settings.paymentGateways.easyPaisaStoreId}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentGateways: { ...settings.paymentGateways, easyPaisaStoreId: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Corporate Settlement IBAN (Meezan / HBL)</label>
              <input
                type="text"
                value={settings.paymentGateways.corporateIBAN}
                onChange={(e) => setSettings({
                  ...settings,
                  paymentGateways: { ...settings.paymentGateways, corporateIBAN: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-emerald-600"
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">PTA Approved Sender ID (Mask)</label>
              <input
                type="text"
                value={settings.smsGateway.defaultMask}
                onChange={(e) => setSettings({
                  ...settings,
                  smsGateway: { ...settings.smsGateway, defaultMask: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-teal-700 dark:text-teal-300"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">SMS Gateway Provider</label>
              <input
                type="text"
                value={settings.smsGateway.provider}
                onChange={(e) => setSettings({
                  ...settings,
                  smsGateway: { ...settings.smsGateway, provider: e.target.value }
                })}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-semibold"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-700 dark:text-slate-300 font-bold">Prepaid SMS Balance</label>
              <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono font-bold text-emerald-600">
                PKR {settings.smsGateway.balancePKR.toLocaleString()} (~{Math.round(settings.smsGateway.balancePKR / 0.85).toLocaleString()} SMS)
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Security Defaults */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Super Admin Security & Access Rules</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Enforce Two-Factor Authentication (2FA)</div>
                <div className="text-slate-400 text-[11px]">Mandatory for all internal Super Admin personnel</div>
              </div>
              <input
                type="checkbox"
                checked={settings.security.enforce2FA}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, enforce2FA: e.target.checked }
                })}
                className="w-4 h-4 text-teal-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl">
              <div>
                <div className="font-bold text-slate-900 dark:text-white">Session Inactivity Timeout</div>
                <div className="text-slate-400 text-[11px]">Auto-logout after inactivity</div>
              </div>
              <select
                value={settings.security.sessionTimeoutMinutes}
                onChange={(e) => setSettings({
                  ...settings,
                  security: { ...settings.security, sessionTimeoutMinutes: Number(e.target.value) }
                })}
                className="p-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold"
              >
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
