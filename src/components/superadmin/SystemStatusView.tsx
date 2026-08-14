import React, { useState } from 'react';
import { 
  Activity, 
  Server, 
  Database, 
  Cloud, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HardDrive, 
  Zap, 
  Power, 
  Download,
  Clock
} from 'lucide-react';
import { SystemServiceStatus } from '../../types/superAdmin';

interface SystemStatusViewProps {
  systemServices: SystemServiceStatus[];
  onTriggerBackup: () => void;
  onFlushCache: () => void;
}

export const SystemStatusView: React.FC<SystemStatusViewProps> = ({
  systemServices,
  onTriggerBackup,
  onFlushCache
}) => {
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isFlushing, setIsFlushing] = useState(false);

  const handleBackup = () => {
    setIsBackingUp(true);
    onTriggerBackup();
    setTimeout(() => setIsBackingUp(false), 2000);
  };

  const handleFlush = () => {
    setIsFlushing(true);
    onFlushCache();
    setTimeout(() => setIsFlushing(false), 1500);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Platform Infrastructure & Health
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              99.98% SLA
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time telemetry for multi-tenant database clusters, 1Link payment connectors, and PTA SMS aggregators.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleFlush}
            disabled={isFlushing}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-4 h-4 text-teal-600 ${isFlushing ? 'animate-spin' : ''}`} />
            <span>{isFlushing ? 'Flushing Redis...' : 'Flush Redis Cache'}</span>
          </button>

          <button
            onClick={handleBackup}
            disabled={isBackingUp}
            className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs shadow-md shadow-teal-600/20 transition-all flex items-center gap-1.5"
          >
            <Database className={`w-4 h-4 ${isBackingUp ? 'animate-bounce' : ''}`} />
            <span>{isBackingUp ? 'Snapshot in progress...' : 'Backup All Tenant DBs'}</span>
          </button>
        </div>
      </div>

      {/* Maintenance Mode Card */}
      <div className={`p-5 rounded-3xl border transition-all ${
        maintenanceMode 
          ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-200' 
          : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
              maintenanceMode ? 'bg-amber-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}>
              <Power className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                Global Platform Maintenance Mode
              </div>
              <div className="text-xs text-slate-400 mt-0.5">
                {maintenanceMode 
                  ? 'Active: All non-Super Admin school logins receive standard maintenance screen' 
                  : 'Disabled: All educational institutes and student portals operating normally'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setMaintenanceMode(!maintenanceMode)}
            className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
              maintenanceMode
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            {maintenanceMode ? 'Disable Maintenance Mode' : 'Enable Maintenance Mode'}
          </button>
        </div>
      </div>

      {/* Microservices Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {systemServices.map((svc) => (
          <div
            key={svc.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3"
          >
            <div className="flex items-center justify-between">
              <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                {svc.name}
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                svc.status === 'Operational'
                  ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}>
                {svc.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-slate-400 block text-[10px]">UPTIME</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{svc.uptime}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">LATENCY</span>
                <span className="font-mono font-bold text-teal-600">{svc.latencyMs}ms</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400">
              Last checked: {svc.lastChecked}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
