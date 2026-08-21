import { apiRequest } from '../api/client';
import { institutesApi, usersApi, auditApi, feesApi } from '../api/services';
import {
  SchoolTenant,
  GlobalUser,
  AuditLog,
  PaymentTransaction,
  SystemServiceStatus,
  AuditSeverity
} from './types';

function mapInstituteToSchool(i: any, userCounts: Record<string, Record<string, number>>): SchoolTenant {
  const counts = userCounts[i.id] || {};
  return {
    id: i.id,
    code: i.code || '',
    name: i.name || 'Institute',
    logo: i.logo_url || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=120&auto=format&fit=crop&q=80',
    type: 'Private School',
    address: i.address || '',
    city: i.city || 'Islamabad',
    province: 'Islamabad Capital Territory',
    phone: i.phone || '',
    email: i.email || '',
    website: i.domain || '',
    principalName: 'Principal',
    principalEmail: '',
    principalPhone: '',
    planId: 'free',
    planName: 'Professional',
    billingCycle: 'monthly',
    status: i.is_active ? 'Active' : 'Suspended',
    studentCount: counts.student || 0,
    maxStudents: 1000,
    teacherCount: counts.teacher || 0,
    maxTeachers: 200,
    staffCount: counts.staff || counts.administrator || 0,
    parentCount: counts.parent || 0,
    coursesCount: 0,
    maxCourses: 100,
    storageUsedGB: 0,
    storageLimitGB: 10,
    monthlyFeePKR: 0,
    annualFeePKR: 0,
    nextBillingDate: '',
    createdDate: (i.created_at || '').slice(0, 10),
    lastActive: (i.updated_at || '').slice(0, 10),
    academicSystem: 'Federal Board (FBISE)',
    gradingSystem: 'Percentage (Board)',
    timezone: 'Asia/Karachi',
    currency: i.currency || 'PKR'
  };
}

function mapUserToGlobalUser(u: any): GlobalUser {
  const roleMap: Record<string, GlobalUser['role']> = {
    super_admin: 'Super Admin',
    principal: 'Principal',
    administrator: 'Administrator',
    teacher: 'Teacher',
    student: 'Student',
    parent: 'Parent',
    accountant: 'Accountant',
    staff: 'Staff'
  };
  return {
    id: u.id,
    name: u.full_name,
    email: u.email,
    phone: u.phone,
    role: roleMap[u.role] || 'Staff',
    schoolId: u.institute_id,
    schoolName: u.institute_name || '',
    status: u.is_active ? 'Active' : 'Suspended',
    lastActive: u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : '',
    createdDate: (u.created_at || '').slice(0, 10),
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80'
  };
}

function mapAuditLogToView(a: any): AuditLog {
  const sevMap: Record<string, AuditSeverity> = {
    LOGIN_SUCCESS: 'success',
    LOGOUT: 'info',
    PASSWORD_RESET: 'warning',
    LOGIN_FAILED: 'danger',
    BULK_ATTENDANCE_MARKED: 'info',
    COLLECT_FEE_PAYMENT: 'success',
    RECORD_CREATED: 'info',
    TENANT_PROVISIONED: 'success'
  };
  return {
    id: a.id,
    timestamp: a.created_at
      ? new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      : '',
    actor: a.user_name || 'System',
    action: (a.action || '').replace(/_/g, ' '),
    target: a.target_resource || '',
    category: 'Platform',
    ipAddress: a.ip_address || '',
    severity: sevMap[a.action] || 'info',
    details: a.metadata_json || '',
    result: a.action === 'LOGIN_FAILED' ? 'Failed' : 'Success'
  };
}

function mapPaymentToTransaction(p: any): PaymentTransaction {
  return {
    id: p.id,
    transactionRef: p.receipt_no || p.id,
    schoolId: p.institute_id,
    schoolName: p.institute_name || '',
    invoiceNo: p.invoice_no || '',
    amountPKR: p.amount_pkr || 0,
    taxPKR: 0,
    discountPKR: 0,
    netAmountPKR: p.amount_pkr || 0,
    currency: 'PKR',
    paymentMethod: { JAZZCASH: 'JazzCash', EASYPAISA: 'EasyPaisa', BANK_TRANSFER: 'Bank Transfer (Meezan/HBL)', CASH: '1Link 1Bill', ONLINE_CARD: 'Stripe' }[p.payment_method] as PaymentTransaction['paymentMethod'] || 'JazzCash',
    status: 'Paid',
    date: (p.paid_date || p.created_at || '').slice(0, 10),
    paidAt: p.paid_date,
    gatewayRef: p.transaction_ref || '',
    notes: p.notes || ''
  };
}

export interface SuperAdminBackendData {
  schools: SchoolTenant[];
  users: GlobalUser[];
  auditLogs: AuditLog[];
  transactions: PaymentTransaction[];
  systemServices: SystemServiceStatus[];
  synced: boolean;
}

export async function loadSuperAdminBackendData(): Promise<SuperAdminBackendData> {
  const [institutesRes, usersRes, auditRes, paymentsRes, healthRes] = await Promise.allSettled([
    institutesApi.list(),
    usersApi.list(),
    auditApi.list({ limit: '100' }),
    feesApi.payments(),
    apiRequest<any>('/health')
  ]);

  const userCounts: Record<string, Record<string, number>> = {};
  if (usersRes.status === 'fulfilled') {
    for (const u of usersRes.value) {
      userCounts[u.institute_id] = userCounts[u.institute_id] || {};
      userCounts[u.institute_id][u.role] = (userCounts[u.institute_id][u.role] || 0) + 1;
    }
  }

  const schools =
    institutesRes.status === 'fulfilled'
      ? institutesRes.value.map((i) => mapInstituteToSchool(i, userCounts))
      : [];

  const users =
    usersRes.status === 'fulfilled' ? usersRes.value.map(mapUserToGlobalUser) : [];

  const auditLogs =
    auditRes.status === 'fulfilled' ? auditRes.value.map(mapAuditLogToView) : [];

  const transactions =
    paymentsRes.status === 'fulfilled' ? paymentsRes.value.map(mapPaymentToTransaction) : [];

  const healthData = healthRes.status === 'fulfilled' ? healthRes.value : null;
  const systemServices: SystemServiceStatus[] = [
    {
      name: 'TaleemLMS Core API',
      category: 'Core API',
      status: healthData ? 'Operational' : 'Down',
      uptimePct: healthData ? 100 : 0,
      latencyMs: healthData ? 42 : 0,
      lastChecked: new Date().toLocaleTimeString(),
      description: 'Express REST API serving all modules'
    },
    {
      name: 'MongoDB Cloud (Atlas)',
      category: 'Database',
      status: healthData?.database === 'MongoDB Cloud' ? 'Operational' : 'Degraded',
      uptimePct: healthData?.database === 'MongoDB Cloud' ? 100 : 50,
      latencyMs: 18,
      lastChecked: new Date().toLocaleTimeString(),
      description: healthData?.database === 'MongoDB Cloud' ? 'Connected to MongoDB Atlas' : 'Running on in-memory fallback'
    }
  ];

  return { schools, users, auditLogs, transactions, systemServices, synced: true };
}