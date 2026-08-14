import React from 'react';
import { Eye, ArrowRight, ShieldCheck } from 'lucide-react';
import { SchoolTenant } from '../../types/superAdmin';

interface ImpersonationBannerProps {
  impersonatedSchool?: SchoolTenant | null;
  impersonatedRole?: string;
  impersonatedName?: string;
  schoolName?: string;
  onExitImpersonation?: () => void;
  onStopImpersonation?: () => void;
}

export const ImpersonationBanner: React.FC<ImpersonationBannerProps> = ({
  impersonatedSchool,
  impersonatedRole,
  impersonatedName,
  schoolName,
  onExitImpersonation,
  onStopImpersonation
}) => {
  const handleExit = onExitImpersonation || onStopImpersonation || (() => {});
  
  const displaySchool = schoolName || impersonatedSchool?.name || 'School Tenant';
  const displayUser = impersonatedName 
    ? `${impersonatedName} (${impersonatedRole || 'Admin'})` 
    : impersonatedSchool 
    ? `Campus Principal: ${impersonatedSchool.principalName} (${impersonatedSchool.code})` 
    : '';

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 text-white px-4 py-2 text-xs font-medium shadow-md flex items-center justify-between sticky top-0 z-50 animate-in slide-in-from-top duration-200">
      <div className="flex items-center gap-2.5 max-w-4xl truncate">
        <span className="p-1 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
          <Eye className="w-3.5 h-3.5" />
        </span>
        <div className="truncate">
          <span className="font-bold tracking-wide uppercase text-[10px] bg-black/25 px-2 py-0.5 rounded-md mr-2">
            Super Admin Impersonation Mode
          </span>
          <span className="font-semibold">Active Session:</span>{' '}
          <span className="underline font-bold">{displaySchool}</span>{' '}
          {displayUser && <span className="opacity-90">• {displayUser}</span>}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className="hidden md:inline-flex text-[11px] opacity-90 items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          Audit Log Active
        </span>
        <button
          onClick={handleExit}
          className="px-3 py-1 bg-white hover:bg-slate-100 text-amber-900 font-bold rounded-lg text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Exit to Super Admin</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
