import { SystemRole, Permission } from '../types/backend';

export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    'institute.view', 'institute.create', 'institute.edit', 'institute.delete',
    'user.view', 'user.create', 'user.edit', 'user.delete',
    'student.view', 'student.create', 'student.edit', 'student.delete', 'student.archive', 'student.transfer',
    'teacher.view', 'teacher.create', 'teacher.edit', 'teacher.delete', 'teacher.assign',
    'parent.view', 'parent.create', 'parent.edit', 'parent.delete', 'parent.link',
    'academics.view', 'academics.manage',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.report',
    'lms.view', 'lms.create', 'lms.edit', 'lms.delete', 'assignment.submit', 'assignment.grade',
    'exam.view', 'exam.create', 'exam.edit', 'exam.delete',
    'grades.view', 'grades.create', 'grades.edit',
    'timetable.view', 'timetable.manage',
    'fees.view', 'fees.create', 'fees.edit', 'fees.collect', 'fees.refund',
    'announcement.view', 'announcement.create',
    'message.send', 'message.view',
    'reports.view', 'reports.export',
    'audit.view'
  ],
  principal: [
    'institute.view', 'institute.edit',
    'user.view', 'user.create', 'user.edit',
    'student.view', 'student.create', 'student.edit', 'student.archive', 'student.transfer',
    'teacher.view', 'teacher.create', 'teacher.edit', 'teacher.assign',
    'parent.view', 'parent.create', 'parent.edit', 'parent.link',
    'academics.view', 'academics.manage',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.report',
    'lms.view', 'lms.create', 'lms.edit', 'lms.delete', 'assignment.grade',
    'exam.view', 'exam.create', 'exam.edit',
    'grades.view', 'grades.create', 'grades.edit',
    'timetable.view', 'timetable.manage',
    'fees.view', 'fees.create', 'fees.edit', 'fees.collect', 'fees.refund',
    'announcement.view', 'announcement.create',
    'message.send', 'message.view',
    'reports.view', 'reports.export',
    'audit.view'
  ],
  administrator: [
    'institute.view',
    'user.view', 'user.create', 'user.edit',
    'student.view', 'student.create', 'student.edit', 'student.archive', 'student.transfer',
    'teacher.view', 'teacher.create', 'teacher.edit', 'teacher.assign',
    'parent.view', 'parent.create', 'parent.edit', 'parent.link',
    'academics.view', 'academics.manage',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.report',
    'lms.view',
    'exam.view', 'exam.create',
    'grades.view',
    'timetable.view', 'timetable.manage',
    'fees.view', 'fees.create', 'fees.collect',
    'announcement.view', 'announcement.create',
    'message.send', 'message.view',
    'reports.view', 'reports.export'
  ],
  teacher: [
    'institute.view',
    'student.view',
    'teacher.view',
    'academics.view',
    'attendance.view', 'attendance.create', 'attendance.edit', 'attendance.report',
    'lms.view', 'lms.create', 'lms.edit', 'assignment.grade',
    'exam.view',
    'grades.view', 'grades.create', 'grades.edit',
    'timetable.view',
    'announcement.view', 'announcement.create',
    'message.send', 'message.view',
    'reports.view'
  ],
  student: [
    'institute.view',
    'student.view',
    'academics.view',
    'attendance.view',
    'lms.view', 'assignment.submit',
    'exam.view',
    'grades.view',
    'timetable.view',
    'fees.view',
    'announcement.view',
    'message.send', 'message.view'
  ],
  parent: [
    'institute.view',
    'student.view',
    'attendance.view',
    'lms.view',
    'exam.view',
    'grades.view',
    'timetable.view',
    'fees.view',
    'announcement.view',
    'message.send', 'message.view'
  ],
  accountant: [
    'institute.view',
    'student.view',
    'fees.view', 'fees.create', 'fees.edit', 'fees.collect', 'fees.refund',
    'reports.view', 'reports.export',
    'announcement.view',
    'message.send', 'message.view'
  ],
  staff: [
    'institute.view',
    'attendance.view',
    'announcement.view',
    'message.send', 'message.view'
  ]
};

export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  SECRET: process.env.JWT_SECRET || 'taleem_lms_super_secret_jwt_key_2026_pakistan',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'taleem_lms_super_secret_refresh_key_2026'
};

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 8,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 mins
  RATE_LIMIT_MAX_REQUESTS: 200
};
