import React, { useState } from 'react';
import {
  GraduationCap,
  Search,
  Filter,
  Plus,
  Download,
  Upload,
  MoreVertical,
  CheckCircle,
  XCircle,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  Home,
  FileText,
  CreditCard,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { Student } from '../../types';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (newStudent: Partial<Student>) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
}

export const StudentManagement: React.FC<StudentManagementProps> = ({
  students,
  onAddStudent,
  onEditStudent,
  onDeleteStudent
}) => {
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Form State for Add/Edit
  const [formData, setFormData] = useState<Partial<Student>>({
    name: '',
    rollNo: '',
    guardianName: '',
    phone: '+92 300 0000000',
    email: '',
    className: 'Class 10',
    section: 'A',
    status: 'Active',
    admissionYear: '2025',
    feeAmountPKR: 18500,
    address: 'Islamabad',
    cnicBForm: '61101-0000000-0'
  });

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(search.toLowerCase()) ||
      s.guardianName.toLowerCase().includes(search.toLowerCase());
    const matchesClass = classFilter === 'All' || s.className === classFilter;
    const matchesSection = sectionFilter === 'All' || s.section === sectionFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesClass && matchesSection && matchesStatus;
  });

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(filteredStudents.map((s) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.rollNo) return;
    onAddStudent(formData);
    setShowAddModal(false);
    alert(`Student ${formData.name} added successfully.`);
  };

  const exportCSV = () => {
    const headers = 'ID,RollNo,Name,Class,Section,Guardian,Phone,FeeStatus,Attendance%\n';
    const rows = filteredStudents
      .map((s) => `${s.id},${s.rollNo},"${s.name}",${s.className},${s.section},"${s.guardianName}",${s.phone},${s.feeStatus},${s.attendancePct}`)
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Student_Records_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Title & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            Student Management Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage student profiles, academic status, guardians, attendance & PKR fee records
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-md shadow-teal-700/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Student
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Input */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name, roll no, or guardian..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Class Filter */}
          <div>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Classes</option>
              <option value="Class 10">Class 10</option>
              <option value="Class 9">Class 9</option>
              <option value="Class 8">Class 8</option>
              <option value="F.Sc Part 1">F.Sc Part 1</option>
            </select>
          </div>

          {/* Section Filter */}
          <div>
            <select
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Sections</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="Science B">Science B</option>
              <option value="Pre-Medical A">Pre-Medical A</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Graduated">Graduated</option>
            </select>
          </div>
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-900 dark:text-teal-200 text-xs">
            <span>{selectedIds.length} students selected</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => alert(`Marked ${selectedIds.length} students active`)}
                className="px-2.5 py-1 rounded-lg bg-teal-700 text-white font-bold"
              >
                Mark Active
              </button>
              <button
                onClick={() => {
                  selectedIds.forEach((id) => onDeleteStudent(id));
                  setSelectedIds([]);
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Professional Data Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-3.5 pl-4 w-10">
                  <input
                    type="checkbox"
                    onChange={handleSelectAll}
                    checked={selectedIds.length === filteredStudents.length && filteredStudents.length > 0}
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  />
                </th>
                <th className="p-3.5">Roll No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class / Sec</th>
                <th className="p-3.5">Guardian & Contact</th>
                <th className="p-3.5 text-center">Attendance %</th>
                <th className="p-3.5 text-center">Fee Status</th>
                <th className="p-3.5 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400">
                    No student records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((std) => {
                  const isChecked = selectedIds.includes(std.id);
                  return (
                    <tr
                      key={std.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isChecked ? 'bg-teal-50/40 dark:bg-teal-950/20' : ''
                      }`}
                    >
                      <td className="p-3.5 pl-4">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(std.id)}
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                        />
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white font-mono">
                        {std.rollNo}
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <img src={std.avatar} alt={std.name} className="w-8 h-8 rounded-full object-cover" />
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{std.name}</p>
                            <p className="text-[10px] text-slate-400">Adm Year: {std.admissionYear}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3.5 font-medium text-slate-700 dark:text-slate-300">
                        {std.className} ({std.section})
                      </td>
                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{std.guardianName}</p>
                        <p className="text-[10px] text-slate-400">{std.phone}</p>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            std.attendancePct >= 80
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {std.attendancePct}%
                        </span>
                      </td>
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] ${
                            std.feeStatus === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : std.feeStatus === 'Pending'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {std.feeStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right pr-4 space-x-1">
                        <button
                          onClick={() => setSelectedStudent(std)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-teal-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="View Profile"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onDeleteStudent(std.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                          title="Delete Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Drawer / Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setSelectedStudent(null)} />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-4">
                <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-teal-600/30" />
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{selectedStudent.name}</h3>
                  <p className="text-xs text-slate-500">Roll No: {selectedStudent.rollNo} • Class: {selectedStudent.className} ({selectedStudent.section})</p>
                </div>
              </div>
              <button onClick={() => setSelectedStudent(null)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100">
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Guardian Details</p>
                <p className="font-bold text-slate-800 dark:text-slate-100">{selectedStudent.guardianName}</p>
                <p className="text-slate-500">Phone: {selectedStudent.phone}</p>
                <p className="text-slate-500">B-Form/CNIC: {selectedStudent.cnicBForm}</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <p className="font-bold text-slate-400 uppercase text-[10px]">Academic Summary</p>
                <p className="font-bold text-teal-700 dark:text-teal-300">GPA: {selectedStudent.gpa} / 4.0</p>
                <p className="text-slate-500">Attendance: {selectedStudent.attendancePct}%</p>
                <p className="text-slate-500">Monthly Fee: PKR {selectedStudent.feeAmountPKR.toLocaleString()}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button onClick={() => setSelectedStudent(null)} className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold text-xs">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <form onSubmit={handleSaveStudent} className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Student</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="e.g. Usman Ali"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Roll Number</label>
                <input
                  type="text"
                  required
                  value={formData.rollNo}
                  onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                  placeholder="e.g. IMC-2025-130"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Guardian Name</label>
                <input
                  type="text"
                  value={formData.guardianName}
                  onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                  className="w-full p-2.5 mt-1 bg-slate-50 dark:bg-slate-800 border rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-300">Phone (+92)</label>
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
                Save Student
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
