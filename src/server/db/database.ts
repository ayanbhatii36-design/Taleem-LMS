import {
  Institute,
  User,
  StudentEntity,
  TeacherEntity,
  ParentEntity,
  ParentStudentLink,
  AcademicYear,
  Term,
  ClassEntity,
  SectionEntity,
  SubjectEntity,
  CourseEntity,
  AttendanceRecord,
  AssignmentEntity,
  SubmissionEntity,
  ExamEntity,
  ExamSubjectEntity,
  GradeRecordEntity,
  TimetableSlotEntity,
  FeeStructure,
  InvoiceEntity,
  PaymentRecord,
  AnnouncementEntity,
  MessageEntity,
  NotificationEntity,
  AuditLogEntity
} from '../types/backend';

class RelationalDatabase {
  public institutes: Institute[] = [];
  public users: User[] = [];
  public students: StudentEntity[] = [];
  public teachers: TeacherEntity[] = [];
  public parents: ParentEntity[] = [];
  public parentStudentLinks: ParentStudentLink[] = [];
  public academicYears: AcademicYear[] = [];
  public terms: Term[] = [];
  public classes: ClassEntity[] = [];
  public sections: SectionEntity[] = [];
  public subjects: SubjectEntity[] = [];
  public courses: CourseEntity[] = [];
  public attendance: AttendanceRecord[] = [];
  public assignments: AssignmentEntity[] = [];
  public submissions: SubmissionEntity[] = [];
  public exams: ExamEntity[] = [];
  public examSubjects: ExamSubjectEntity[] = [];
  public gradeRecords: GradeRecordEntity[] = [];
  public timetableSlots: TimetableSlotEntity[] = [];
  public feeStructures: FeeStructure[] = [];
  public invoices: InvoiceEntity[] = [];
  public payments: PaymentRecord[] = [];
  public announcements: AnnouncementEntity[] = [];
  public messages: MessageEntity[] = [];
  public notifications: NotificationEntity[] = [];
  public auditLogs: AuditLogEntity[] = [];

  // Helper filters by tenant
  public findUserByEmail(email: string, instituteId?: string): User | undefined {
    return this.users.find((u) => {
      if (u.is_deleted) return false;
      const emailMatches = u.email.toLowerCase() === email.toLowerCase();
      if (instituteId) {
        return emailMatches && u.institute_id === instituteId;
      }
      return emailMatches;
    });
  }

  public findUserById(id: string): User | undefined {
    return this.users.find((u) => u.id === id && !u.is_deleted);
  }

  public findStudentByUserId(userId: string): StudentEntity | undefined {
    return this.students.find((s) => s.user_id === userId && !s.is_deleted);
  }

  public findTeacherByUserId(userId: string): TeacherEntity | undefined {
    return this.teachers.find((t) => t.user_id === userId && !t.is_deleted);
  }

  public findParentByUserId(userId: string): ParentEntity | undefined {
    return this.parents.find((p) => p.user_id === userId && !p.is_deleted);
  }

  public getChildrenForParent(parentId: string): StudentEntity[] {
    const links = this.parentStudentLinks.filter((l) => l.parent_id === parentId);
    const studentIds = links.map((l) => l.student_id);
    return this.students.filter((s) => studentIds.includes(s.id) && !s.is_deleted);
  }

  public logAudit(
    instituteId: string,
    userId: string,
    userName: string,
    userRole: string,
    action: string,
    targetResource: string,
    targetId?: string,
    ipAddress?: string,
    metadata?: any
  ) {
    const log: AuditLogEntity = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      institute_id: instituteId,
      user_id: userId,
      user_name: userName,
      user_role: userRole,
      action,
      target_resource: targetResource,
      target_id: targetId,
      ip_address: ipAddress || '127.0.0.1',
      metadata_json: metadata ? JSON.stringify(metadata) : undefined,
      created_at: new Date().toISOString()
    };
    this.auditLogs.unshift(log);
  }
}

export const db = new RelationalDatabase();
