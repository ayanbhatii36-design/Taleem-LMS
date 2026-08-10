import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { AttendanceRecord, NotificationEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Query Attendance Records
router.get('/', requirePermission('attendance.view'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, date, student_id, start_date, end_date } = req.query;

  let records = db.attendance.filter((a) => a.institute_id === req.institute_id);

  // Authorization restriction for student/parent
  if (req.user?.role === 'student') {
    const student = db.findStudentByUserId(req.user.id);
    if (student) records = records.filter((a) => a.student_id === student.id);
  } else if (req.user?.role === 'parent') {
    const parent = db.findParentByUserId(req.user.id);
    const children = parent ? db.getChildrenForParent(parent.id) : [];
    const childIds = children.map((c) => c.id);
    records = records.filter((a) => childIds.includes(a.student_id));
  }

  if (class_id) records = records.filter((a) => a.class_id === class_id);
  if (section_id) records = records.filter((a) => a.section_id === section_id);
  if (date) records = records.filter((a) => a.date === date);
  if (student_id) records = records.filter((a) => a.student_id === student_id);
  if (start_date && end_date) {
    records = records.filter((a) => a.date >= (start_date as string) && a.date <= (end_date as string));
  }

  return sendSuccess(res, records);
});

// Calculate Attendance Stats & Low-Attendance Threshold Alerts (< 75%)
router.get('/analytics', requirePermission('attendance.view'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, threshold = '75' } = req.query;
  const thresholdPct = parseFloat(threshold as string);

  let students = db.students.filter((s) => s.institute_id === req.institute_id && !s.is_deleted);
  if (class_id) students = students.filter((s) => s.class_id === class_id);
  if (section_id) students = students.filter((s) => s.section_id === section_id);

  const studentStats = students.map((s) => {
    const att = db.attendance.filter((a) => a.student_id === s.id);
    const totalDays = att.length;
    const presentDays = att.filter((a) => a.status === 'PRESENT' || a.status === 'LATE').length;
    const absentDays = att.filter((a) => a.status === 'ABSENT').length;
    const pct = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 100;

    return {
      student_id: s.id,
      roll_no: s.roll_no,
      full_name: s.full_name,
      guardian_phone: s.guardian_phone,
      totalDays,
      presentDays,
      absentDays,
      attendancePercentage: pct,
      isBelowThreshold: pct < thresholdPct
    };
  });

  const lowAttendanceAlerts = studentStats.filter((st) => st.isBelowThreshold && st.totalDays > 0);

  return sendSuccess(res, {
    totalStudents: students.length,
    studentStats,
    lowAttendanceAlertsCount: lowAttendanceAlerts.length,
    lowAttendanceAlerts
  });
});

// Bulk Attendance Submission API (Supports marking 30-50 students at once in a single transaction)
router.post('/bulk', requirePermission('attendance.create'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, date, records } = req.body;

  if (!class_id || !section_id || !date || !Array.isArray(records)) {
    return sendError(res, 'class_id, section_id, date, and records array are required', 400);
  }

  const dateStr = (date as string).slice(0, 10);
  let savedCount = 0;
  const absentStudentIds: string[] = [];

  records.forEach((item: { student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }) => {
    // Check if record exists
    const existingIndex = db.attendance.findIndex(
      (a) => a.institute_id === req.institute_id && a.student_id === item.student_id && a.date === dateStr
    );

    const recordPayload: AttendanceRecord = {
      id: existingIndex >= 0 ? db.attendance[existingIndex].id : `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      institute_id: req.institute_id!,
      student_id: item.student_id,
      class_id,
      section_id,
      date: dateStr,
      status: item.status,
      remarks: item.remarks || '',
      marked_by_user_id: req.user!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      db.attendance[existingIndex] = recordPayload;
    } else {
      db.attendance.push(recordPayload);
    }

    if (item.status === 'ABSENT') {
      absentStudentIds.push(item.student_id);
    }
    savedCount++;
  });

  // Automatically trigger notifications to parents of absent students
  absentStudentIds.forEach((stdId) => {
    const student = db.students.find((s) => s.id === stdId);
    if (student) {
      const parentLink = db.parentStudentLinks.find((l) => l.student_id === stdId);
      if (parentLink) {
        const parent = db.parents.find((p) => p.id === parentLink.parent_id);
        if (parent) {
          const notif: NotificationEntity = {
            id: `notif-abs-${Date.now()}-${Math.floor(Math.random() * 100)}`,
            institute_id: req.institute_id!,
            user_id: parent.user_id,
            title: 'Absence Alert',
            body: `Your child ${student.full_name} was marked ABSENT on ${dateStr}.`,
            type: 'ATTENDANCE',
            is_read: false,
            created_at: new Date().toISOString()
          };
          db.notifications.push(notif);
        }
      }
    }
  });

  db.logAudit(
    req.institute_id!,
    req.user!.id,
    req.user!.full_name,
    req.user!.role,
    'BULK_ATTENDANCE_MARKED',
    'ATTENDANCE',
    `${class_id}:${section_id}`,
    req.ip,
    { date: dateStr, totalMarked: savedCount, absentCount: absentStudentIds.length }
  );

  return sendSuccess(res, { savedCount, date: dateStr }, `Successfully saved attendance for ${savedCount} students`);
});

export default router;
