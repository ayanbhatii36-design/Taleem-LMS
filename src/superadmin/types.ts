// Super Admin & Multi-Tenant SaaS Types for TaleemLM Pakistan

export type SchoolStatus = 'Active' | 'Trial' | 'Pending' | 'Suspended' | 'Expired' | 'Cancelled';
export type SubscriptionCycle = 'monthly' | 'annual';
export type PaymentStatus = 'Paid' | 'Pending' | 'Failed' | 'Refunded' | 'Cancelled';
export type PaymentMethod = 
  | '1Link 1Bill' 
  | 'JazzCash' 
  | 'EasyPaisa' 
  | 'Bank Transfer (Meezan/HBL)' 
  | 'Raast' 
  | 'Stripe' 
  | 'PayFast';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting for Customer' | 'Resolved' | 'Closed';
export type TicketCategory = 'Billing' | 'Technical' | 'Academics & LMS' | 'Feature Request' | 'Urgent Outage';

export type TeamRole = 
  | 'Super Admin' 
  | 'Platform Admin' 
  | 'Finance Admin' 
  | 'Support Agent' 
  | 'Sales Manager' 
  | 'Technical Admin' 
  | 'Read-only Analyst';

export interface SchoolTenant {
  id: string;
  code: string;
  name: string;
  logo: string;
  type: 'Private School' | 'College' | 'Cadet College' | 'Higher Secondary' | 'O/A Levels Academy' | 'Islamic Institute';
  address: string;
  city: string;
  province: 'Punjab' | 'Sindh' | 'Khyber Pakhtunkhwa' | 'Balochistan' | 'Islamabad Capital Territory' | 'Gilgit-Baltistan' | 'Azad Kashmir';
  phone: string;
  email: string;
  website?: string;
  principalName: string;
  principalEmail: string;
  principalPhone: string;
  planId: string;
  planName: 'Starter' | 'Professional' | 'Enterprise' | 'Custom Campus';
  billingCycle: SubscriptionCycle;
  status: SchoolStatus;
  studentCount: number;
  maxStudents: number;
  teacherCount: number;
  maxTeachers: number;
  staffCount: number;
  parentCount: number;
  coursesCount: number;
  maxCourses: number;
  storageUsedGB: number;
  storageLimitGB: number;
  monthlyFeePKR: number;
  annualFeePKR: number;
  nextBillingDate: string;
  trialEndsAt?: string;
  createdDate: string;
  lastActive: string;
  academicSystem: 'National Matric / FSc' | 'Cambridge (O/A Levels)' | 'Federal Board (FBISE)' | 'IB World' | 'Dars-e-Nizami';
  gradingSystem: 'Percentage (Board)' | 'GPA 4.0' | 'Cambridge (A*-U)';
  timezone: string;
  currency: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  tagline: string;
  monthlyPricePKR: number;
  annualPricePKR: number;
  maxStudents: number;
  maxTeachers: number;
  maxStaff: number;
  storageGB: number;
  maxCourses: number;
  features: string[];
  supportLevel: 'Standard (Email)' | 'Priority (Phone & WhatsApp)' | '24/7 Dedicated SLA' | 'Dedicated Account Manager';
  trialPeriodDays: number;
  status: 'Active' | 'Archived' | 'Draft';
  subscriberCount: number;
  isPopular?: boolean;
}

export interface PaymentTransaction {
  id: string;
  transactionRef: string;
  schoolId: string;
  schoolName: string;
  invoiceNo: string;
  amountPKR: number;
  taxPKR: number;
  discountPKR: number;
  netAmountPKR: number;
  currency: 'PKR' | 'USD';
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  date: string;
  paidAt?: string;
  gatewayRef?: string;
  failureReason?: string;
  notes?: string;
  receiptUrl?: string;
}

export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Super Admin' | 'Principal' | 'Administrator' | 'Teacher' | 'Student' | 'Parent' | 'Accountant' | 'Staff';
  schoolId?: string;
  schoolName: string;
  status: 'Active' | 'Suspended' | 'Pending Verification';
  lastActive: string;
  createdDate: string;
  avatar: string;
  cnic?: string;
}

export interface SupportTicketMessage {
  id: string;
  sender: string;
  role: 'Super Admin' | 'School Principal' | 'Support Agent';
  avatar: string;
  text: string;
  timestamp: string;
  isInternal?: boolean;
  attachment?: { name: string; size: string; url: string };
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  schoolId: string;
  schoolName: string;
  subject: string;
  priority: TicketPriority;
  category: TicketCategory;
  assignedAgent: {
    id: string;
    name: string;
    avatar: string;
    email: string;
  };
  status: TicketStatus;
  createdDate: string;
  updatedDate: string;
  messages: SupportTicketMessage[];
  internalNotes: {
    id: string;
    author: string;
    text: string;
    date: string;
  }[];
}

export interface SuperAdminTeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamRole;
  permissions: string[];
  status: 'Active' | 'Invited' | 'Suspended';
  lastLogin: string;
  avatar: string;
  department: 'Executive' | 'Operations' | 'Finance' | 'Customer Support' | 'Engineering' | 'Sales';
}

export type AuditSeverity = 'info' | 'warning' | 'danger' | 'critical' | 'success';

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  adminName?: string;
  adminEmail?: string;
  adminRole?: string;
  action: string;
  target: string;
  category: string;
  schoolName?: string;
  ipAddress: string;
  location?: string;
  severity: AuditSeverity;
  details: string;
  result?: 'Success' | 'Failed';
}

export type PlatformSettings = SuperAdminSettingsState;

export interface SystemServiceStatus {
  name: string;
  category: 'Core API' | 'Database' | 'Storage' | 'Queue' | 'Communication' | 'Payment Gateway';
  status: 'Operational' | 'Warning' | 'Degraded' | 'Down';
  uptimePct: number;
  latencyMs: number;
  lastChecked: string;
  description: string;
}

export interface SystemIncident {
  id: string;
  title: string;
  status: 'Investigating' | 'Identified' | 'Monitoring' | 'Resolved';
  severity: 'Minor' | 'Major' | 'Critical';
  affectedService: string;
  startedAt: string;
  resolvedAt?: string;
  message: string;
}

export interface GlobalAnnouncement {
  id: string;
  title: string;
  content: string;
  targetType: 'all_schools' | 'plan' | 'city' | 'status';
  targetFilterValue?: string;
  type: 'info' | 'warning' | 'maintenance' | 'emergency';
  channels: ('email' | 'in_app' | 'sms' | 'push')[];
  status: 'Draft' | 'Scheduled' | 'Sent';
  scheduledAt?: string;
  sentAt?: string;
  author: string;
  recipientCount: number;
}

export interface SuperAdminSettingsState {
  companyName: string;
  supportEmail: string;
  supportPhone: string;
  billingCurrency: 'PKR' | 'USD';
  defaultTrialDays: number;
  autoInvoicing: boolean;
  smsGatewayProvider: 'Telenor SMS Pro' | 'Jazz SMS Connect' | 'Zong Enterprise' | 'Twilio';
  whatsappApiEnabled: boolean;
  twoFactorEnforced: boolean;
  maintenanceMode: boolean;
  jazzCashMerchantId: string;
  easyPaisaStoreId: string;
  oneLinkBillerCode: string;
  stripePublicKey: string;
  storageProvider: 'Cloudflare R2' | 'AWS S3' | 'Google Cloud Storage';
  backupFrequency: 'Daily (03:00 AM PKT)' | 'Hourly' | 'Weekly';
  allowSelfRegistration: boolean;
}
