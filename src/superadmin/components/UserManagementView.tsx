import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Search, 
  Filter, 
  ShieldCheck, 
  Key, 
  ExternalLink, 
  Lock, 
  Unlock, 
  Eye, 
  Building2, 
  UserCheck, 
  Sparkles, 
  Phone, 
  Mail, 
  X,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { GlobalUser, SchoolTenant } from '../types';

interface UserManagementViewProps {
  users: GlobalUser[];
  schools: SchoolTenant[];
  onImpersonateUser: (user: GlobalUser, reason: string) => void;
  onToggleUserStatus: (userId: string, currentStatus: string) => void;
  onResetUserPassword: (userId: string, newPass: string) => void;
  onSelectSchool: (school: SchoolTenant) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  schools,
  onImpersonateUser,
  onToggleUserStatus,
  onResetUserPassword,
  onSelectSchool
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Modals
  const [impersonateTarget, setImpersonateTarget] = useState<GlobalUser | null>(null);
  const [impersonateReason, setImpersonateReason] = useState('');
  const [passwordTarget, setPasswordTarget] = useState<GlobalUser | null>(null);
  const [newPassword, setNewPassword] = useState('Pass#' + Math.floor(1000 + Math.random() * 9000));
  const [isResetDone, setIsResetDone] = useState(false);

  const roleOptions = useMemo(() => {
    return Array.from(new Set(users.map(u => u.role))).sort();
  }, [users]);

  const statusOptions = useMemo(() => {
    return Array.from(new Set(users.map(u => u.status))).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(usr => {
      const matchesSearch = 
        usr.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usr.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        usr.phone.includes(searchQuery) ||
        usr.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (usr.cnic && usr.cnic.includes(searchQuery));

      const matchesRole = roleFilter === 'All' || usr.role === roleFilter;
      const matchesStatus = statusFilter === 'All' || usr.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  const handleConfirmImpersonate = () => {
    if (impersonateTarget) {
      onImpersonateUser(impersonateTarget, impersonateReason || '');
      setImpersonateTarget(null);
      setImpersonateReason('');
    }
  };

  const handleConfirmPasswordReset = () => {
    if (passwordTarget) {
      onResetUserPassword(passwordTarget.id, newPassword);
      setIsResetDone(true);
      setTimeout(() => {
        setIsResetDone(false);
        setPasswordTarget(null);
      }, 2000);
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Global Platform Users Directory
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Cross-Tenant Directory
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Search principals, teachers, students, parents, and administrative staff across all institutions in Pakistan.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, +92 mobile, CNIC, or school..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All User Roles</option>
              {roleOptions.map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              {statusOptions.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Users Master Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="py-3.5 px-5">User Profile</th>
                <th className="py-3.5 px-4">Role</th>
                <th className="py-3.5 px-4">Institution / Campus</th>
                <th className="py-3.5 px-4">Phone / WhatsApp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Active</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredUsers.map((usr) => (
                <tr key={usr.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <img
                        src={usr.avatar}
                        alt={usr.name}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                      />
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white">
                          {usr.name}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {usr.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      usr.role === 'Super Admin'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : usr.role === 'Principal'
                        ? 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300'
                        : usr.role === 'Teacher'
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        : usr.role === 'Student'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}>
                      {usr.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">
                    {usr.schoolName}
                  </td>

                  <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-400">
                    {usr.phone}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      usr.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                    }`}>
                      {usr.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                    {usr.lastActive}
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Impersonate Button */}
                      {usr.role !== 'Super Admin' && (
                        <button
                          onClick={() => setImpersonateTarget(usr)}
                          className="px-2.5 py-1 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] flex items-center gap-1 cursor-pointer"
                          title="Impersonate User"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Login As</span>
                        </button>
                      )}

                      {/* Password Reset */}
                      <button
                        onClick={() => setPasswordTarget(usr)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        title="Reset Password"
                      >
                        <Key className="w-4 h-4" />
                      </button>

                      {/* Disable / Enable User */}
                      {usr.role !== 'Super Admin' && (
                        <button
                          onClick={() => onToggleUserStatus(usr.id, usr.status)}
                          className="p-1.5 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 text-slate-400 hover:text-amber-600"
                          title={usr.status === 'Active' ? 'Disable Account' : 'Re-enable Account'}
                        >
                          {usr.status === 'Active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4 text-emerald-600" />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impersonation Modal */}
      {impersonateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setImpersonateTarget(null)} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-teal-600" />
              <span>Impersonate User Session</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              You are about to simulate <strong className="text-slate-900 dark:text-white">{impersonateTarget.name}</strong> ({impersonateTarget.role} at {impersonateTarget.schoolName}).
            </p>

            <div className="mt-4 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-900 dark:text-amber-200">
              This action is logged in immutable Super Admin security audit trail with your IP and timestamp.
            </div>

            <div className="mt-4 space-y-1.5 text-xs font-medium">
              <label className="font-bold text-slate-700 dark:text-slate-300">Audit Justification / Reason:</label>
              <input
                type="text"
                value={impersonateReason}
                onChange={(e) => setImpersonateReason(e.target.value)}
                placeholder="e.g. Diagnosing report card export or exam rubric error"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2 text-xs">
              <button onClick={() => setImpersonateTarget(null)} className="px-4 py-2 text-slate-500 font-semibold">
                Cancel
              </button>
              <button onClick={handleConfirmImpersonate} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">
                Proceed to Impersonate
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {passwordTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setPasswordTarget(null)} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Key className="w-4 h-4 text-teal-600" />
              <span>Reset User Credentials</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Generate new login password for {passwordTarget.name} ({passwordTarget.email}).
            </p>

            <div className="mt-4 space-y-2 text-xs font-medium">
              <label className="font-bold text-slate-700 dark:text-slate-300">New Temporary Password:</label>
              <input
                type="text"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl font-mono font-bold text-teal-600"
              />
            </div>

            {isResetDone ? (
              <div className="mt-4 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-bold text-center">
                Password updated successfully!
              </div>
            ) : (
              <div className="mt-5 flex justify-end gap-2 text-xs">
                <button onClick={() => setPasswordTarget(null)} className="px-4 py-2 text-slate-500 font-semibold">
                  Cancel
                </button>
                <button onClick={handleConfirmPasswordReset} className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md">
                  Update Password
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
