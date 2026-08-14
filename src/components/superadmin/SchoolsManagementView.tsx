import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  Search, 
  Filter, 
  Plus, 
  ExternalLink, 
  MoreVertical, 
  Download, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Eye, 
  Trash2, 
  Edit3, 
  Layers, 
  CreditCard, 
  Users, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  HardDrive,
  BookOpen,
  ArrowUpDown,
  FileSpreadsheet
} from 'lucide-react';
import { SchoolTenant, SchoolStatus } from '../../types/superAdmin';

interface SchoolsManagementViewProps {
  schools: SchoolTenant[];
  onSelectSchool: (school: SchoolTenant) => void;
  onOpenAddSchoolModal: () => void;
  onImpersonateSchool: (school: SchoolTenant) => void;
  onOpenSubscriptionModal: (school: SchoolTenant) => void;
  onToggleSuspendSchool: (schoolId: string, currentStatus: SchoolStatus) => void;
  onRequestDeleteSchool: (school: SchoolTenant) => void;
}

export const SchoolsManagementView: React.FC<SchoolsManagementViewProps> = ({
  schools,
  onSelectSchool,
  onOpenAddSchoolModal,
  onImpersonateSchool,
  onOpenSubscriptionModal,
  onToggleSuspendSchool,
  onRequestDeleteSchool
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [provinceFilter, setProvinceFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'students' | 'mrr' | 'created'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Status Tab Counts
  const statusCounts = useMemo(() => {
    return {
      All: schools.length,
      Active: schools.filter(s => s.status === 'Active').length,
      Trial: schools.filter(s => s.status === 'Trial').length,
      Pending: schools.filter(s => s.status === 'Pending').length,
      Suspended: schools.filter(s => s.status === 'Suspended').length,
      Expired: schools.filter(s => s.status === 'Expired').length
    };
  }, [schools]);

  // Filtered & Sorted Schools
  const filteredSchools = useMemo(() => {
    return schools.filter(school => {
      const matchesSearch = 
        school.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.principalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        school.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || school.status === statusFilter;
      const matchesPlan = planFilter === 'All' || school.planName === planFilter;
      const matchesProvince = provinceFilter === 'All' || school.province === provinceFilter;

      return matchesSearch && matchesStatus && matchesPlan && matchesProvince;
    }).sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') comparison = a.name.localeCompare(b.name);
      else if (sortBy === 'students') comparison = a.studentCount - b.studentCount;
      else if (sortBy === 'mrr') comparison = a.monthlyFeePKR - b.monthlyFeePKR;
      else if (sortBy === 'created') comparison = a.createdDate.localeCompare(b.createdDate);

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [schools, searchQuery, statusFilter, planFilter, provinceFilter, sortBy, sortOrder]);

  const handleExportCSV = () => {
    const headers = ['School ID', 'Name', 'Type', 'City', 'Province', 'Plan', 'Status', 'Students', 'Teachers', 'MRR (PKR)', 'Principal', 'Phone', 'Created Date'];
    const rows = filteredSchools.map(s => [
      s.code,
      `"${s.name}"`,
      s.type,
      s.city,
      s.province,
      s.planName,
      s.status,
      s.studentCount,
      s.teacherCount,
      s.monthlyFeePKR,
      `"${s.principalName}"`,
      s.principalPhone,
      s.createdDate
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaleemLM_Schools_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header with Title and Onboard CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              School & Campus Management
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              {filteredSchools.length} Institutes
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage multi-tenant campuses, subscription tiers, academic configs, capacity limits, and administrator impersonation.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenAddSchoolModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Onboard New School</span>
          </button>
        </div>
      </div>

      {/* Status Segmented Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Active', 'Trial', 'Pending', 'Suspended'] as const).map((st) => {
          const count = statusCounts[st as keyof typeof statusCounts] || 0;
          const isActive = statusFilter === st;

          return (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shrink-0 flex items-center gap-2 cursor-pointer ${
                isActive
                  ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <span>{st === 'All' ? 'All Institutes' : st}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter & Search Bar Card */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-3 text-xs">
        {/* Search Field */}
        <div className="relative w-full lg:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by school name, campus ID, city, principal..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs font-medium"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Plan Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Plan:</span>
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Plans</option>
              <option value="Starter">Starter</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
              <option value="Custom Campus">Custom Campus</option>
            </select>
          </div>

          {/* Province Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Province:</span>
            <select
              value={provinceFilter}
              onChange={(e) => setProvinceFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All">All Provinces</option>
              <option value="Punjab">Punjab</option>
              <option value="Sindh">Sindh</option>
              <option value="Islamabad Capital Territory">Islamabad (ICT)</option>
              <option value="Khyber Pakhtunkhwa">KPK</option>
              <option value="Balochistan">Balochistan</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb as any);
                setSortOrder(so as any);
              }}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="students-desc">Students (Highest)</option>
              <option value="mrr-desc">MRR (Highest)</option>
              <option value="created-desc">Newest Onboarded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Schools Master Table Card */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-5">Institute & Code</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Subscription Plan</th>
                <th className="py-3.5 px-4">Capacity & Usage</th>
                <th className="py-3.5 px-4">Recurring Fee</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Primary Contact</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredSchools.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 opacity-40 text-teal-600" />
                    <p className="font-bold text-slate-600 dark:text-slate-300">No schools match your search filters</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your keyword or clearing active status filters</p>
                  </td>
                </tr>
              ) : (
                filteredSchools.map((school) => {
                  const studentUsagePct = Math.round((school.studentCount / school.maxStudents) * 100);
                  const isMenuOpen = activeActionMenuId === school.id;

                  return (
                    <tr 
                      key={school.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors group"
                    >
                      {/* School & Code */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <img
                            src={school.logo}
                            alt={school.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <div className="min-w-0 max-w-xs">
                            <button
                              onClick={() => onSelectSchool(school)}
                              className="font-bold text-slate-900 dark:text-white hover:text-teal-600 dark:hover:text-teal-400 text-left truncate block cursor-pointer"
                            >
                              {school.name}
                            </button>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5 font-mono">
                              <span className="px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 font-semibold text-slate-600 dark:text-slate-300">
                                {school.code}
                              </span>
                              <span>•</span>
                              <span>{school.type}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{school.city}</span>
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {school.province}
                        </div>
                      </td>

                      {/* Subscription Plan */}
                      <td className="py-3.5 px-4">
                        <button
                          onClick={() => onOpenSubscriptionModal(school)}
                          className="text-left group/plan cursor-pointer"
                        >
                          <div className="font-bold text-teal-800 dark:text-teal-300 group-hover/plan:underline flex items-center gap-1">
                            <span>{school.planName}</span>
                            <span className="text-[10px] uppercase font-mono px-1 py-0.2 bg-teal-50 dark:bg-teal-950 text-teal-600 rounded">
                              {school.billingCycle}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            Renewal: {school.nextBillingDate}
                          </div>
                        </button>
                      </td>

                      {/* Capacity & Usage */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="font-bold text-slate-800 dark:text-slate-200">
                            {school.studentCount} / {school.maxStudents}
                          </span>
                          <span className={`text-[10px] font-bold ${
                            studentUsagePct > 90 ? 'text-red-500' : 'text-slate-400'
                          }`}>
                            {studentUsagePct}%
                          </span>
                        </div>
                        <div className="w-28 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${
                              studentUsagePct > 90 ? 'bg-red-500' : studentUsagePct > 75 ? 'bg-amber-500' : 'bg-teal-600'
                            }`}
                            style={{ width: `${Math.min(studentUsagePct, 100)}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {school.teacherCount} Teachers • {school.storageUsedGB.toFixed(0)} GB
                        </div>
                      </td>

                      {/* Recurring Fee (PKR) */}
                      <td className="py-3.5 px-4">
                        <div className="font-mono font-bold text-slate-900 dark:text-white">
                          PKR {school.monthlyFeePKR.toLocaleString()}
                          <span className="text-[10px] font-normal text-slate-400">/mo</span>
                        </div>
                        <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                          PKR {school.annualFeePKR.toLocaleString()}/yr
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          school.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50'
                            : school.status === 'Trial'
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200/50 dark:border-blue-800/50'
                            : school.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/50 dark:border-amber-800/50'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 border border-red-200/50 dark:border-red-800/50'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            school.status === 'Active' ? 'bg-emerald-500' : school.status === 'Trial' ? 'bg-blue-500' : 'bg-amber-500'
                          }`} />
                          <span>{school.status}</span>
                        </span>
                      </td>

                      {/* Primary Contact */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">
                          {school.principalName}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {school.principalPhone}
                        </div>
                      </td>

                      {/* Action Menu */}
                      <td className="py-3.5 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Impersonate Principal Button */}
                          <button
                            onClick={() => onImpersonateSchool(school)}
                            className="px-2.5 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900 text-teal-700 dark:text-teal-300 font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer"
                            title="Impersonate School Principal"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Impersonate</span>
                          </button>

                          {/* Inspect Details Button */}
                          <button
                            onClick={() => onSelectSchool(school)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                            title="View Full Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* More Options Dropdown Toggle */}
                          <button
                            onClick={() => setActiveActionMenuId(isMenuOpen ? null : school.id)}
                            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Action Menu Modal Popover */}
                        {isMenuOpen && (
                          <div 
                            className="absolute right-5 mt-1 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-1.5 z-40 text-left animate-in fade-in-50 zoom-in-95"
                            onMouseLeave={() => setActiveActionMenuId(null)}
                          >
                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                onSelectSchool(school);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-400" />
                              <span>View Complete Details</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                onOpenSubscriptionModal(school);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                            >
                              <Layers className="w-3.5 h-3.5 text-teal-600" />
                              <span>Manage Subscription</span>
                            </button>

                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                onToggleSuspendSchool(school.id, school.status);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-xs font-semibold"
                            >
                              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                              <span>{school.status === 'Suspended' ? 'Reactivate Tenant' : 'Suspend Tenant'}</span>
                            </button>

                            <div className="h-px bg-slate-100 dark:bg-slate-800 my-1" />

                            <button
                              onClick={() => {
                                setActiveActionMenuId(null);
                                onRequestDeleteSchool(school);
                              }}
                              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete School Tenant</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
