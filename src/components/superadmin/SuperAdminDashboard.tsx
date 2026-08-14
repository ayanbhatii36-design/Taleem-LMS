import React, { useState, useEffect } from 'react';
import { SuperAdminSidebar } from './SuperAdminSidebar';
import { SuperAdminTopNav } from './SuperAdminTopNav';
import { ImpersonationBanner } from './ImpersonationBanner';
import { CommandPalette } from './CommandPalette';
import { ConfirmDangerModal } from './ConfirmDangerModal';
import { DashboardOverview } from './DashboardOverview';
import { SchoolsManagementView } from './SchoolsManagementView';
import { SchoolDetailsView } from './SchoolDetailsView';
import { SubscriptionPlansView } from './SubscriptionPlansView';
import { SubscriptionDetailsModal } from './SubscriptionDetailsModal';
import { AddSchoolWizardModal } from './AddSchoolWizardModal';
import { BillingPaymentsView } from './BillingPaymentsView';
import { UserManagementView } from './UserManagementView';
import { SupportTicketsView } from './SupportTicketsView';
import { PlatformAnalyticsView } from './PlatformAnalyticsView';
import { AuditLogsView } from './AuditLogsView';
import { SystemStatusView } from './SystemStatusView';
import { GlobalSettingsView } from './GlobalSettingsView';

import { 
  SchoolTenant, 
  SubscriptionPlan, 
  PaymentTransaction, 
  GlobalUser, 
  SupportTicket, 
  AuditLog, 
  SystemServiceStatus, 
  PlatformSettings,
  SchoolStatus,
  TicketStatus
} from '../../types/superAdmin';

import { 
  INITIAL_SUPER_ADMIN, 
  INITIAL_SCHOOLS, 
  INITIAL_PLANS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_GLOBAL_USERS, 
  INITIAL_TICKETS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_SYSTEM_SERVICES, 
  INITIAL_SETTINGS 
} from '../../data/superAdminData';

interface SuperAdminDashboardProps {
  onExitSuperAdmin: () => void;
  onLaunchSchoolPortal: (school: SchoolTenant, role?: string) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  onExitSuperAdmin,
  onLaunchSchoolPortal,
  isDarkMode,
  onToggleDarkMode
}) => {
  // Navigation State
  const [activeSection, setActiveSection] = useState<string>('overview');
  const [selectedSchool, setSelectedSchool] = useState<SchoolTenant | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Entities State
  const [schools, setSchools] = useState<SchoolTenant[]>(INITIAL_SCHOOLS);
  const [plans, setPlans] = useState<SubscriptionPlan[]>(INITIAL_PLANS);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(INITIAL_TRANSACTIONS);
  const [users, setUsers] = useState<GlobalUser[]>(INITIAL_GLOBAL_USERS);
  const [tickets, setTickets] = useState<SupportTicket[]>(INITIAL_TICKETS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [systemServices, setSystemServices] = useState<SystemServiceStatus[]>(INITIAL_SYSTEM_SERVICES);
  const [settings, setSettings] = useState<PlatformSettings>(INITIAL_SETTINGS);

  // Modals & UI States
  const [isCmdPaletteOpen, setIsCmdPaletteOpen] = useState(false);
  const [isAddSchoolOpen, setIsAddSchoolOpen] = useState(false);
  const [subscriptionModalSchool, setSubscriptionModalSchool] = useState<SchoolTenant | null>(null);
  const [dangerModalConfig, setDangerModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    requiredWord: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    requiredWord: 'DELETE',
    onConfirm: () => {}
  });

  // Impersonation state
  const [impersonatedEntity, setImpersonatedEntity] = useState<{
    type: 'school' | 'user';
    name: string;
    role: string;
    schoolName?: string;
    schoolData?: SchoolTenant;
  } | null>(null);

  // Keyboard shortcut for Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsCmdPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Helper to log audit event
  const addAuditLog = (action: string, target: string, category: AuditLog['category'], severity: AuditLog['severity'], details: string) => {
    const newLog: AuditLog = {
      id: `audit-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      actor: INITIAL_SUPER_ADMIN.name,
      action,
      target,
      category,
      severity,
      ipAddress: '182.185.142.90',
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // School actions
  const handleSelectSchool = (school: SchoolTenant) => {
    setSelectedSchool(school);
    setActiveSection('school-detail');
  };

  const handleSchoolCreated = (newSchool: SchoolTenant) => {
    setSchools(prev => [newSchool, ...prev]);
    addAuditLog(
      'Tenant Provisioned',
      newSchool.name,
      'Tenant Management',
      'success',
      `New school campus ${newSchool.name} (${newSchool.code}) onboarded on ${newSchool.planName} tier.`
    );
  };

  const handleToggleSuspendSchool = (schoolId: string, currentStatus: SchoolStatus) => {
    const nextStatus: SchoolStatus = currentStatus === 'Suspended' ? 'Active' : 'Suspended';
    setSchools(prev => prev.map(s => s.id === schoolId ? { ...s, status: nextStatus } : s));
    const targetSchool = schools.find(s => s.id === schoolId);
    if (targetSchool) {
      addAuditLog(
        nextStatus === 'Suspended' ? 'Tenant Suspended' : 'Tenant Reactivated',
        targetSchool.name,
        'Security',
        nextStatus === 'Suspended' ? 'warning' : 'success',
        `School ${targetSchool.name} was ${nextStatus.toLowerCase()} by Super Admin.`
      );
    }
  };

  const handleRequestDeleteSchool = (school: SchoolTenant) => {
    setDangerModalConfig({
      isOpen: true,
      title: `Permanently Delete ${school.name}?`,
      description: `This action will permanently purge the isolated tenant database, all ${school.studentCount} student profiles, examination records, and teacher logins. This cannot be undone.`,
      requiredWord: 'DELETE',
      onConfirm: () => {
        setSchools(prev => prev.filter(s => s.id !== school.id));
        if (selectedSchool?.id === school.id) {
          setSelectedSchool(null);
          setActiveSection('schools');
        }
        addAuditLog(
          'Tenant Purged',
          school.name,
          'Tenant Management',
          'critical',
          `School tenant ${school.name} (${school.code}) was permanently deleted from the platform.`
        );
      }
    });
  };

  const handleImpersonateSchool = (school: SchoolTenant) => {
    setImpersonatedEntity({
      type: 'school',
      name: school.principalName,
      role: 'Principal',
      schoolName: school.name,
      schoolData: school
    });
    addAuditLog(
      'Session Impersonation Started',
      `${school.principalName} (${school.name})`,
      'Impersonation',
      'warning',
      `Super admin started impersonating Principal of ${school.name}.`
    );
    // Switch to school portal
    onLaunchSchoolPortal(school, 'Principal');
  };

  const handleImpersonateUser = (user: GlobalUser, reason: string) => {
    const school = schools.find(s => s.id === user.schoolId) || schools[0];
    setImpersonatedEntity({
      type: 'user',
      name: user.name,
      role: user.role,
      schoolName: user.schoolName,
      schoolData: school
    });
    addAuditLog(
      'User Impersonation Started',
      `${user.name} (${user.role})`,
      'Impersonation',
      'warning',
      `Impersonated user ${user.name} at ${user.schoolName}. Reason: ${reason}`
    );
    onLaunchSchoolPortal(school, user.role);
  };

  const handleStopImpersonation = () => {
    if (impersonatedEntity) {
      addAuditLog(
        'Session Impersonation Ended',
        impersonatedEntity.name,
        'Impersonation',
        'info',
        `Exited impersonation of ${impersonatedEntity.name}.`
      );
      setImpersonatedEntity(null);
    }
  };

  // Plan actions
  const handleUpdatePlan = (updatedPlan: SubscriptionPlan) => {
    setPlans(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    addAuditLog(
      'Plan Tier Modified',
      updatedPlan.name,
      'Billing',
      'info',
      `Updated pricing and resource limits for ${updatedPlan.name} tier.`
    );
  };

  const handleSaveSubscription = (schoolId: string, updatedData: any) => {
    setSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        return {
          ...s,
          planId: updatedData.planId,
          planName: updatedData.planName,
          billingCycle: updatedData.billingCycle,
          monthlyFeePKR: updatedData.monthlyFeePKR,
          annualFeePKR: updatedData.annualFeePKR,
          trialEndsAt: updatedData.trialEndsAt || s.trialEndsAt
        };
      }
      return s;
    }));
    const targetSchool = schools.find(s => s.id === schoolId);
    if (targetSchool) {
      addAuditLog(
        'Subscription Changed',
        targetSchool.name,
        'Billing',
        'info',
        `Adjusted plan to ${updatedData.planName} (${updatedData.billingCycle}) for ${targetSchool.name}.`
      );
    }
  };

  // Billing Actions
  const handleRefundTransaction = (txId: string, reason: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Refunded' } : t));
    const targetTx = transactions.find(t => t.id === txId);
    if (targetTx) {
      addAuditLog(
        'Payment Refunded',
        targetTx.invoiceNo,
        'Billing',
        'warning',
        `Refunded PKR ${targetTx.netAmountPKR.toLocaleString()} for ${targetTx.schoolName}. Reason: ${reason}`
      );
    }
  };

  const handleRetryPayment = (txId: string) => {
    setTransactions(prev => prev.map(t => t.id === txId ? { ...t, status: 'Paid', date: 'Just now' } : t));
    const targetTx = transactions.find(t => t.id === txId);
    if (targetTx) {
      addAuditLog(
        'Payment Re-settled',
        targetTx.invoiceNo,
        'Billing',
        'success',
        `Re-triggered 1Link settlement for ${targetTx.schoolName} - Status: Paid.`
      );
    }
  };

  // User Actions
  const handleToggleUserStatus = (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus as any } : u));
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addAuditLog(
        nextStatus === 'Suspended' ? 'User Account Suspended' : 'User Account Restored',
        targetUser.name,
        'Security',
        nextStatus === 'Suspended' ? 'warning' : 'success',
        `User ${targetUser.name} (${targetUser.role}) status set to ${nextStatus}.`
      );
    }
  };

  const handleResetUserPassword = (userId: string, newPass: string) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      addAuditLog(
        'Credentials Reset',
        targetUser.name,
        'Security',
        'info',
        `Super admin regenerated login password for ${targetUser.name} (${targetUser.email}).`
      );
    }
  };

  // Ticket Actions
  const handleReplyTicket = (ticketId: string, replyText: string) => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        const newMessage = {
          id: `msg-${Date.now()}`,
          senderName: INITIAL_SUPER_ADMIN.name,
          senderType: 'SuperAdmin' as const,
          content: replyText,
          timestamp: 'Just now'
        };
        return {
          ...t,
          status: 'In Progress',
          messages: [...t.messages, newMessage]
        };
      }
      return t;
    }));
    addAuditLog(
      'Support Ticket Replied',
      ticketId,
      'Tenant Management',
      'info',
      `Super admin responded to ticket ${ticketId}.`
    );
  };

  const handleUpdateTicketStatus = (ticketId: string, status: TicketStatus) => {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status } : t));
    addAuditLog(
      'Support Ticket Status Changed',
      ticketId,
      'Tenant Management',
      'info',
      `Ticket ${ticketId} status updated to ${status}.`
    );
  };

  // System Actions
  const handleTriggerBackup = () => {
    addAuditLog(
      'Cluster Backup Created',
      'PostgreSQL Production Cluster',
      'System',
      'success',
      'Manual multi-tenant database snapshot generated across all Pakistani campuses.'
    );
  };

  const handleFlushCache = () => {
    addAuditLog(
      'Redis Cache Flushed',
      'Redis Session Cluster',
      'System',
      'info',
      'Purged cached permission claims and session tokens.'
    );
  };

  const handleSaveSettings = (newSettings: PlatformSettings) => {
    setSettings(newSettings);
    addAuditLog(
      'Root Platform Settings Updated',
      'TaleemLM Global Config',
      'System',
      'warning',
      'Super Admin updated payment gateway credentials or SMS masks.'
    );
  };

  // Calculate Badge counts for sidebar
  const pendingSchoolsCount = schools.filter(s => s.status === 'Pending').length;
  const openTicketsCount = tickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length;
  const failedPaymentsCount = transactions.filter(t => t.status === 'Failed').length;

  return (
    <div className="min-h-screen bg-slate-50/90 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Impersonation Banner if Active */}
      {impersonatedEntity && (
        <ImpersonationBanner
          impersonatedRole={impersonatedEntity.role}
          impersonatedName={impersonatedEntity.name}
          schoolName={impersonatedEntity.schoolName}
          onStopImpersonation={handleStopImpersonation}
        />
      )}

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <SuperAdminSidebar
          activeSection={activeSection}
          onSelectSection={(sec) => {
            setActiveSection(sec);
            if (sec !== 'school-detail') {
              setSelectedSchool(null);
            }
          }}
          schools={schools}
          supportTickets={tickets}
          transactions={transactions}
          pendingSchoolsCount={pendingSchoolsCount}
          openTicketsCount={openTicketsCount}
          failedPaymentsCount={failedPaymentsCount}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenAddSchoolModal={() => setIsAddSchoolOpen(true)}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {/* Top Navigation Bar */}
          <SuperAdminTopNav
            adminUser={INITIAL_SUPER_ADMIN}
            onOpenCommandPalette={() => setIsCmdPaletteOpen(true)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={onToggleDarkMode}
            onOpenSettings={() => setActiveSection('settings')}
            onExitSuperAdmin={onExitSuperAdmin}
            supportTickets={tickets}
            systemServices={systemServices}
            onNavigateTab={(sec) => setActiveSection(sec)}
          />

          {/* Dynamic Section View */}
          <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
            {activeSection === 'overview' && (
              <DashboardOverview
                schools={schools}
                plans={plans}
                transactions={transactions}
                tickets={tickets}
                systemServices={systemServices}
                auditLogs={auditLogs}
                onSelectSchool={handleSelectSchool}
                onOpenAddSchoolModal={() => setIsAddSchoolOpen(true)}
                onNavigate={(sec) => setActiveSection(sec)}
              />
            )}

            {activeSection === 'schools' && (
              <SchoolsManagementView
                schools={schools}
                onSelectSchool={handleSelectSchool}
                onOpenAddSchoolModal={() => setIsAddSchoolOpen(true)}
                onImpersonateSchool={handleImpersonateSchool}
                onOpenSubscriptionModal={(school) => setSubscriptionModalSchool(school)}
                onToggleSuspendSchool={handleToggleSuspendSchool}
                onRequestDeleteSchool={handleRequestDeleteSchool}
              />
            )}

            {activeSection === 'school-detail' && selectedSchool && (
              <SchoolDetailsView
                school={selectedSchool}
                transactions={transactions}
                tickets={tickets}
                users={users}
                auditLogs={auditLogs}
                onBack={() => {
                  setSelectedSchool(null);
                  setActiveSection('schools');
                }}
                onImpersonateSchool={handleImpersonateSchool}
                onOpenSubscriptionModal={(school) => setSubscriptionModalSchool(school)}
                onToggleSuspendSchool={handleToggleSuspendSchool}
                onRequestDeleteSchool={handleRequestDeleteSchool}
              />
            )}

            {activeSection === 'plans' && (
              <SubscriptionPlansView
                plans={plans}
                schools={schools}
                onUpdatePlan={handleUpdatePlan}
              />
            )}

            {activeSection === 'billing' && (
              <BillingPaymentsView
                transactions={transactions}
                onRefundTransaction={handleRefundTransaction}
                onRetryPayment={handleRetryPayment}
              />
            )}

            {activeSection === 'users' && (
              <UserManagementView
                users={users}
                schools={schools}
                onImpersonateUser={handleImpersonateUser}
                onToggleUserStatus={handleToggleUserStatus}
                onResetUserPassword={handleResetUserPassword}
                onSelectSchool={handleSelectSchool}
              />
            )}

            {activeSection === 'tickets' && (
              <SupportTicketsView
                tickets={tickets}
                onReplyTicket={handleReplyTicket}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            )}

            {activeSection === 'analytics' && (
              <PlatformAnalyticsView
                schools={schools}
                transactions={transactions}
              />
            )}

            {activeSection === 'audit' && (
              <AuditLogsView auditLogs={auditLogs} />
            )}

            {activeSection === 'status' && (
              <SystemStatusView
                systemServices={systemServices}
                onTriggerBackup={handleTriggerBackup}
                onFlushCache={handleFlushCache}
              />
            )}

            {activeSection === 'settings' && (
              <GlobalSettingsView
                settings={settings}
                onSaveSettings={handleSaveSettings}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={isCmdPaletteOpen}
        onClose={() => setIsCmdPaletteOpen(false)}
        schools={schools}
        users={users}
        tickets={tickets}
        transactions={transactions}
        onSelectSchool={handleSelectSchool}
        onNavigate={(sec) => setActiveSection(sec)}
        onOpenAddSchool={() => setIsAddSchoolOpen(true)}
      />

      {/* 5-Step Add School Wizard Modal */}
      <AddSchoolWizardModal
        isOpen={isAddSchoolOpen}
        onClose={() => setIsAddSchoolOpen(false)}
        plans={plans}
        onSchoolCreated={handleSchoolCreated}
      />

      {/* Subscription Tier Details & Adjustment Modal */}
      <SubscriptionDetailsModal
        isOpen={!!subscriptionModalSchool}
        onClose={() => setSubscriptionModalSchool(null)}
        school={subscriptionModalSchool}
        plans={plans}
        onSaveSubscription={handleSaveSubscription}
      />

      {/* High-Risk Confirm Danger Modal */}
      <ConfirmDangerModal
        isOpen={dangerModalConfig.isOpen}
        title={dangerModalConfig.title}
        description={dangerModalConfig.description}
        requiredConfirmationWord={dangerModalConfig.requiredWord}
        onConfirm={dangerModalConfig.onConfirm}
        onClose={() => setDangerModalConfig(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};
