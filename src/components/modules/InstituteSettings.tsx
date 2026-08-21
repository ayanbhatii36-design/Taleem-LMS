import React, { useEffect, useState } from 'react';
import {
  Settings,
  Building2,
  Shield,
  Palette,
  Globe,
  Phone,
  Mail,
  CheckCircle2,
  Save
} from 'lucide-react';
import { InstituteInfo } from '../../types';

interface InstituteSettingsProps {
  institute: InstituteInfo;
  onUpdateInstitute: (updated: Partial<InstituteInfo>) => void;
}

export const InstituteSettings: React.FC<InstituteSettingsProps> = ({
  institute,
  onUpdateInstitute
}) => {
  const [formData, setFormData] = useState<InstituteInfo>(institute);

  useEffect(() => {
    setFormData(institute);
  }, [institute]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateInstitute(formData);
    alert('Institute branding and settings saved successfully.');
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Institute Branding & Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure school branding, logo, contact info, academic year and grading rules
          </p>
        </div>

        <button
          onClick={handleSave}
          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
        >
          <Save className="w-4 h-4" /> Save Configuration
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Branding Info Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Institutional Identity & Logo
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Institute Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Tagline / Motto</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Institution Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
              >
                <option value="School">School</option>
                <option value="College">College</option>
                <option value="Academy">Academy</option>
                <option value="Tuition Center">Tuition Center</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Grading System</label>
              <select
                value={formData.gradingSystem}
                onChange={(e) => setFormData({ ...formData, gradingSystem: e.target.value as any })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
              >
                <option value="Percentage (Board)">Percentage (Board Pattern - FBISE)</option>
                <option value="GPA 4.0">GPA 4.0 Scale</option>
                <option value="Cambridge (A*-U)">Cambridge (A*-U)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Contact & Location in Pakistan */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Globe className="w-4 h-4 text-teal-600" />
            Location & Contact Details (Pakistan)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">City / Region</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Official Phone (+92)</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
