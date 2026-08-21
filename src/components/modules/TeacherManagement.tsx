import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Award,
  BookOpen,
  CalendarCheck,
  Star,
  Eye,
  Trash2,
  Edit2,
  UserCheck
} from 'lucide-react';
import { Teacher } from '../../types';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (newTeacher: Partial<Teacher>) => void;
  onDeleteTeacher: (id: string) => void;
}

export const TeacherManagement: React.FC<TeacherManagementProps> = ({
  teachers,
  onAddTeacher,
  onDeleteTeacher
}) => {
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const [formData, setFormData] = useState<Partial<Teacher>>({
    name: '',
    empId: 'TCH-205',
    email: '',
    phone: '+92 300 0000000',
    designation: 'Lecturer',
    qualification: 'M.Sc / M.Phil',
    department: 'Science',
    subjects: ['Physics'],
    assignedClasses: ['Class 10-A'],
    attendancePct: 95,
    performanceRating: 4.8,
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
  });

  const filteredTeachers = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.department.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.some((s) => s.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    onAddTeacher(formData);
    setShowAddModal(false);
    alert(`Faculty member ${formData.name} added successfully.`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Faculty & Teacher Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor educator qualifications, subject assignments, timetables, and performance
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Faculty Member
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by teacher name, subject, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeachers.map((tch) => (
          <div
            key={tch.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={tch.avatar} alt={tch.name} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-teal-600/20" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{tch.name}</h3>
                  <p className="text-[11px] text-teal-700 dark:text-teal-300 font-semibold">{tch.designation}</p>
                  <p className="text-[10px] text-slate-400">{tch.department} Dept • Emp ID: {tch.empId}</p>
                </div>
              </div>

              <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950/60 px-2 py-1 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300 font-black text-xs shrink-0">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{tch.performanceRating}</span>
              </div>
            </div>

            <div className="space-y-1.5 text-xs p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
              <p className="text-[10px] uppercase font-bold text-slate-400">Qualifications</p>
              <p className="font-semibold text-slate-800 dark:text-slate-200 line-clamp-1">{tch.qualification}</p>
              
              <p className="text-[10px] uppercase font-bold text-slate-400 pt-2">Assigned Subjects</p>
              <div className="flex flex-wrap gap-1">
                {tch.subjects.map((sub, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-900 dark:text-teal-200 text-[10px] font-bold">
                    {sub}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">{tch.assignedClasses.join(', ')}</span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedTeacher(tch)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTeacher(tch.id)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedTeacher(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10">
            <div className="flex items-center gap-4 mb-4">
              <img src={selectedTeacher.avatar} alt={selectedTeacher.name} className="w-16 h-16 rounded-2xl object-cover" />
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedTeacher.name}</h3>
                <p className="text-xs text-teal-600 font-semibold">{selectedTeacher.designation}</p>
                <p className="text-xs text-slate-500">{selectedTeacher.email} • {selectedTeacher.phone}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-6">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Academic Credential</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{selectedTeacher.qualification}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={() => setSelectedTeacher(null)} className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Teacher Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleSave} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Faculty Member</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="e.g. Prof. Sajjad Ali"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Designation</label>
                <input
                  type="text"
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="e.g. Senior Lecturer"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Phone</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl">
                Save Educator
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
