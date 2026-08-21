import { apiRequest } from './client';

// ============================================================== Institutes
export const institutesApi = {
  list: () => apiRequest<any[]>('/institutes'),
  get: (id: string) => apiRequest<any>(`/institutes/${id}`),
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/institutes', { method: 'POST', body: data }),
  update: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/institutes/${id}`, { method: 'PUT', body: data })
};

// ============================================================== Academics
export const academicsApi = {
  years: () => apiRequest<any[]>('/academics/years'),
  createYear: (data: Record<string, unknown>) =>
    apiRequest<any>('/academics/years', { method: 'POST', body: data }),
  terms: () => apiRequest<any[]>('/academics/terms'),
  createTerm: (data: Record<string, unknown>) =>
    apiRequest<any>('/academics/terms', { method: 'POST', body: data }),
  classes: () => apiRequest<any[]>('/academics/classes'),
  createClass: (data: Record<string, unknown>) =>
    apiRequest<any>('/academics/classes', { method: 'POST', body: data }),
  createSection: (data: Record<string, unknown>) =>
    apiRequest<any>('/academics/sections', { method: 'POST', body: data }),
  subjects: () => apiRequest<any[]>('/academics/subjects'),
  createSubject: (data: Record<string, unknown>) =>
    apiRequest<any>('/academics/subjects', { method: 'POST', body: data }),
  courses: () => apiRequest<any[]>('/academics/courses')
};

// ============================================================== Students
export const studentsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/students${qs}`);
  },
  get: (id: string) => apiRequest<any>(`/students/${id}`),
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/students', { method: 'POST', body: data }),
  transfer: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/students/${id}/transfer`, { method: 'POST', body: data }),
  remove: (id: string) => apiRequest<any>(`/students/${id}`, { method: 'DELETE' })
};

// ============================================================== Teachers
export const teachersApi = {
  list: () => apiRequest<any[]>('/teachers'),
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/teachers', { method: 'POST', body: data }),
  remove: (id: string) => apiRequest<any>(`/teachers/${id}`, { method: 'DELETE' })
};

// ============================================================== Parents
export const parentsApi = {
  list: () => apiRequest<any[]>('/parents'),
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/parents', { method: 'POST', body: data }),
  linkStudent: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/parents/${id}/link-student`, { method: 'POST', body: data })
};

// ============================================================== Attendance
export const attendanceApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/attendance${qs}`);
  },
  analytics: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any>(`/attendance/analytics${qs}`);
  },
  bulk: (data: {
    class_id: string;
    section_id: string;
    date: string;
    records: { student_id: string; status: string; remarks?: string }[];
  }) => apiRequest<any>('/attendance/bulk', { method: 'POST', body: data })
};

// ============================================================== LMS
export const lmsApi = {
  assignments: () => apiRequest<any[]>('/lms/assignments'),
  createAssignment: (data: Record<string, unknown>) =>
    apiRequest<any>('/lms/assignments', { method: 'POST', body: data }),
  submitAssignment: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/lms/assignments/${id}/submit`, { method: 'POST', body: data }),
  gradeSubmission: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/lms/submissions/${id}/grade`, { method: 'POST', body: data })
};

// ============================================================== Exams
export const examsApi = {
  list: () => apiRequest<any[]>('/exams'),
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/exams', { method: 'POST', body: data }),
  addSubject: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/exams/${id}/subjects`, { method: 'POST', body: data }),
  bulkGrades: (examSubjectId: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/exams/subjects/${examSubjectId}/grades/bulk`, { method: 'POST', body: data }),
  grades: () => apiRequest<any[]>('/exams/grades')
};

// ============================================================== Timetable
export const timetableApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/timetable${qs}`);
  },
  create: (data: Record<string, unknown>) =>
    apiRequest<any>('/timetable', { method: 'POST', body: data })
};

// ============================================================== Fees (PKR)
export const feesApi = {
  structures: () => apiRequest<any[]>('/fees/structures'),
  createStructure: (data: Record<string, unknown>) =>
    apiRequest<any>('/fees/structures', { method: 'POST', body: data }),
  invoices: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/fees/invoices${qs}`);
  },
  payments: () => apiRequest<any[]>('/fees/payments'),
  generateInvoice: (data: Record<string, unknown>) =>
    apiRequest<any>('/fees/invoices/generate', { method: 'POST', body: data }),
  collectPayment: (id: string, data: Record<string, unknown>) =>
    apiRequest<any>(`/fees/invoices/${id}/collect-payment`, { method: 'POST', body: data })
};

// ============================================================== Communication
export const communicationApi = {
  announcements: () => apiRequest<any[]>('/communication/announcements'),
  createAnnouncement: (data: Record<string, unknown>) =>
    apiRequest<any>('/communication/announcements', { method: 'POST', body: data }),
  messages: () => apiRequest<any[]>('/communication/messages'),
  sendMessage: (data: Record<string, unknown>) =>
    apiRequest<any>('/communication/messages', { method: 'POST', body: data }),
  notifications: () => apiRequest<any[]>('/communication/notifications'),
  markNotificationsRead: (data?: Record<string, unknown>) =>
    apiRequest<any>('/communication/notifications/mark-read', { method: 'PUT', body: data || {} })
};

// ============================================================== Reports
export const reportsApi = {
  executiveSummary: () => apiRequest<any>('/reports/executive-summary'),
  classPerformance: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/reports/class-performance${qs}`);
  },
  exportCsv: () => apiRequest<any>('/reports/export/csv')
};

// ============================================================== Audit
export const auditApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/audit${qs}`);
  }
};

// ============================================================== Users (super admin)
export const usersApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? `?${new URLSearchParams(params).toString()}` : '';
    return apiRequest<any[]>(`/users${qs}`);
  }
};