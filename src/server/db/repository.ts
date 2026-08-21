import { Model } from 'mongoose';
import { isMongoReady } from './mongo/connection';
import { getModel } from './mongo/models';
import { db } from './database';

/**
 * Dual-mode repository.
 * - When MongoDB is connected: queries run against mongoose models.
 * - Otherwise: queries fall back to the in-memory relational store (src/server/db/database.ts).
 * All module routers must use `repo` instead of touching `db` arrays directly
 * so they work against both backends.
 */

export type Filter = Record<string, any>;
export type SortOpt = { field: string; direction?: 1 | -1 };

const MEMORY_TABLES: Record<string, keyof typeof db> = {
  Institute: 'institutes',
  User: 'users',
  Student: 'students',
  Teacher: 'teachers',
  Parent: 'parents',
  ParentStudentLink: 'parentStudentLinks',
  AcademicYear: 'academicYears',
  Term: 'terms',
  Class: 'classes',
  Section: 'sections',
  Subject: 'subjects',
  Course: 'courses',
  ClassSubjectAssignment: 'classSubjectAssignments',
  Attendance: 'attendance',
  Assignment: 'assignments',
  Submission: 'submissions',
  Exam: 'exams',
  ExamSubject: 'examSubjects',
  GradeRecord: 'gradeRecords',
  TimetableSlot: 'timetableSlots',
  FeeStructure: 'feeStructures',
  Invoice: 'invoices',
  Payment: 'payments',
  Announcement: 'announcements',
  Message: 'messages',
  Notification: 'notifications',
  AuditLog: 'auditLogs',
  FileMetadata: 'fileMetadata'
};

function generateId(prefix = 'rec'): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

// ------------------------------------------------------- In-memory matcher
function valueMatches(value: any, condition: any): boolean {
  if (condition && typeof condition === 'object' && !Array.isArray(condition)) {
    if ('$in' in condition) return condition.$in.includes(value);
    if ('$nin' in condition) return !condition.$nin.includes(value);
    if ('$ne' in condition) return value !== condition.$ne;
    if ('$gt' in condition) return value > condition.$gt;
    if ('$gte' in condition) return value >= condition.$gte;
    if ('$lt' in condition) return value < condition.$lt;
    if ('$lte' in condition) return value <= condition.$lte;
    if ('$regex' in condition) {
      const flags = condition.$options || '';
      return new RegExp(condition.$regex, flags).test(String(value ?? ''));
    }
    if ('$exists' in condition) return condition.$exists ? value !== undefined && value !== null : value === undefined || value === null;
    if (value && typeof value === 'object' && typeof condition === 'object') {
      return Object.entries(condition).every(([k, v]) => valueMatches(value[k], v));
    }
    return false;
  }
  return value === condition;
}

export function matchesFilter(doc: any, filter: Filter): boolean {
  if (!filter || Object.keys(filter).length === 0) return true;
  return Object.entries(filter).every(([key, condition]) => {
    if (key === '$or') {
      return Array.isArray(condition) && condition.some((sub) => matchesFilter(doc, sub));
    }
    if (key === '$and') {
      return Array.isArray(condition) && condition.every((sub) => matchesFilter(doc, sub));
    }
    return valueMatches(doc[key], condition);
  });
}

// ----------------------------------------------------------- Entity mapping
function toEntity(doc: any): any {
  if (!doc) return doc;
  const plain = typeof doc.toObject === 'function' ? doc.toObject() : doc;
  const { _id, __v, ...rest } = plain;
  return {
    ...rest,
    id: rest.id || String(_id)
  };
}

// ------------------------------------------------------------- Repository
interface Repository<T> {
  find(filter?: Filter, opts?: { sort?: SortOpt; limit?: number }): Promise<T[]>;
  findOne(filter: Filter): Promise<T | null>;
  insertOne(doc: Partial<T>): Promise<T>;
  insertMany(docs: Partial<T>[]): Promise<T[]>;
  updateOne(filter: Filter, update: Partial<T>): Promise<T | null>;
  updateMany(filter: Filter, update: Partial<T>): Promise<number>;
  deleteOne(filter: Filter): Promise<boolean>;
  deleteMany(filter: Filter): Promise<number>;
  count(filter?: Filter): Promise<number>;
  exists(filter?: Filter): Promise<boolean>;
  isSeeded(): Promise<boolean>;
}

function createRepository<T extends { id: string }>(name: string): Repository<T> {
  return {
    async find(filter = {}, opts = {}) {
      if (isMongoReady()) {
        const model: Model<any> | null = getModel(name);
        if (model) {
          let query = model.find(filter);
          if (opts.sort) {
            query = query.sort({ [opts.sort.field]: opts.sort.direction ?? 1 });
          }
          if (opts.limit) query = query.limit(opts.limit);
          const docs = await query.lean().exec();
          return docs.map(toEntity) as T[];
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      if (!table) return [];
      let rows = table.filter((d) => matchesFilter(d, filter));
      if (opts.sort) {
        const dir = opts.sort.direction ?? 1;
        const field = opts.sort.field;
        rows = [...rows].sort((a, b) => {
          const av = a[field] ?? '';
          const bv = b[field] ?? '';
          if (av < bv) return -1 * dir;
          if (av > bv) return 1 * dir;
          return 0;
        });
      }
      if (opts.limit) rows = rows.slice(0, opts.limit);
      return rows as T[];
    },

    async findOne(filter: Filter) {
      const rows = await this.find(filter, { limit: 1 });
      return rows[0] ?? null;
    },

    async insertOne(doc) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          const now = new Date().toISOString();
          const created = await model.create({
            ...doc,
            id: doc.id || generateId(name.toLowerCase()),
            created_at: (doc as any).created_at || now,
            updated_at: (doc as any).updated_at || now
          });
          return toEntity(created) as T;
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      const now = new Date().toISOString();
      const entity = {
        ...doc,
        id: doc.id || generateId(name.toLowerCase()),
        created_at: (doc as any).created_at || now,
        updated_at: (doc as any).updated_at || now
      };
      table.push(entity);
      return entity as unknown as T;
    },

    async insertMany(docs) {
      const inserted: T[] = [];
      for (const doc of docs) {
        inserted.push(await this.insertOne(doc));
      }
      return inserted;
    },

    async updateOne(filter, update) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          const updated = await model
            .findOneAndUpdate(filter, { $set: { ...update, updated_at: new Date().toISOString() } }, { new: true })
            .lean()
            .exec();
          return updated ? (toEntity(updated) as T) : null;
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      const idx = table.findIndex((d) => matchesFilter(d, filter));
      if (idx === -1) return null;
      table[idx] = { ...table[idx], ...update, updated_at: new Date().toISOString() };
      return table[idx] as T;
    },

    async updateMany(filter, update) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          const result = await model.updateMany(filter, { $set: { ...update, updated_at: new Date().toISOString() } });
          return result.modifiedCount ?? 0;
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      let count = 0;
      table.forEach((d, i) => {
        if (matchesFilter(d, filter)) {
          table[i] = { ...d, ...update, updated_at: new Date().toISOString() };
          count++;
        }
      });
      return count;
    },

    async deleteOne(filter) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          const result = await model.deleteOne(filter);
          return (result.deletedCount ?? 0) > 0;
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      const idx = table.findIndex((d) => matchesFilter(d, filter));
      if (idx === -1) return false;
      table.splice(idx, 1);
      return true;
    },

    async deleteMany(filter) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          const result = await model.deleteMany(filter);
          return result.deletedCount ?? 0;
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      const before = table.length;
      for (let i = table.length - 1; i >= 0; i--) {
        if (matchesFilter(table[i], filter)) table.splice(i, 1);
      }
      return before - table.length;
    },

    async count(filter = {}) {
      if (isMongoReady()) {
        const model = getModel(name);
        if (model) {
          return await model.countDocuments(filter);
        }
      }
      const table = db[MEMORY_TABLES[name]] as unknown as any[];
      return table.filter((d) => matchesFilter(d, filter)).length;
    },

    async exists(filter = {}) {
      return (await this.count(filter)) > 0;
    },

    async isSeeded() {
      return (await this.count({})) > 0;
    }
  };
}

// -------------------------------------------------------- Exported instance
export const repo = {
  institutes: createRepository<import('../types/backend').Institute>('Institute'),
  users: createRepository<import('../types/backend').User>('User'),
  students: createRepository<import('../types/backend').StudentEntity>('Student'),
  teachers: createRepository<import('../types/backend').TeacherEntity>('Teacher'),
  parents: createRepository<import('../types/backend').ParentEntity>('Parent'),
  parentStudentLinks: createRepository<import('../types/backend').ParentStudentLink>('ParentStudentLink'),
  academicYears: createRepository<import('../types/backend').AcademicYear>('AcademicYear'),
  terms: createRepository<import('../types/backend').Term>('Term'),
  classes: createRepository<import('../types/backend').ClassEntity>('Class'),
  sections: createRepository<import('../types/backend').SectionEntity>('Section'),
  subjects: createRepository<import('../types/backend').SubjectEntity>('Subject'),
  courses: createRepository<import('../types/backend').CourseEntity>('Course'),
  classSubjectAssignments: createRepository<any>('ClassSubjectAssignment'),
  attendance: createRepository<import('../types/backend').AttendanceRecord>('Attendance'),
  assignments: createRepository<import('../types/backend').AssignmentEntity>('Assignment'),
  submissions: createRepository<import('../types/backend').SubmissionEntity>('Submission'),
  exams: createRepository<import('../types/backend').ExamEntity>('Exam'),
  examSubjects: createRepository<import('../types/backend').ExamSubjectEntity>('ExamSubject'),
  gradeRecords: createRepository<import('../types/backend').GradeRecordEntity>('GradeRecord'),
  timetableSlots: createRepository<import('../types/backend').TimetableSlotEntity>('TimetableSlot'),
  feeStructures: createRepository<import('../types/backend').FeeStructure>('FeeStructure'),
  invoices: createRepository<import('../types/backend').InvoiceEntity>('Invoice'),
  payments: createRepository<import('../types/backend').PaymentRecord>('Payment'),
  announcements: createRepository<import('../types/backend').AnnouncementEntity>('Announcement'),
  messages: createRepository<import('../types/backend').MessageEntity>('Message'),
  notifications: createRepository<import('../types/backend').NotificationEntity>('Notification'),
  auditLogs: createRepository<import('../types/backend').AuditLogEntity>('AuditLog'),
  fileMetadata: createRepository<any>('FileMetadata')
};

export type Repo = typeof repo;