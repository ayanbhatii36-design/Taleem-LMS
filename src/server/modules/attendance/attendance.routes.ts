import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { AttendanceRecord } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Query Attendance Records
router.get('/', requirePermission('attendance.view'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, date, student_id, start_date, end_date } = req.query;

  const filter: Record<string, any> = { institute_id: req.institute_id };

  // Authorization restriction for student/parent
  if (req.user?.role === 'student') {
    const student = await repo.students.findOne({ user_id: req.user.id });
    if (student) filter.student_id = student.id;
  } else if (req.user?.role === 'parent') {
    const parent = await repo.parents.findOne({ user_id: req.user.id });
    const links = parent ? await repo.parentStudentLinks.find({ parent_id: parent.id }) : [];
    const childIds = links.map((l) => l.student_id);
    filter.student_id = { $in: childIds };
  }

  if (class_id) filter.class_id = class_id;
  if (section_id) filter.section_id = section_id;
  if (date) filter.date = date;
  if (start_date && end_date) {
    filter.date = { $gte: start_date as string, $lte: end_date as string };
  }

  if (student_id && req.user?.role !== 'parent') {
    filter.student_id = student_id;
  }

  const records = await repo.attendance.find(filter);

  return sendSuccess(res, records);
});

// Calculate Attendance Stats & Low-Attendance Threshold Alerts (< 75%)
router.get('/analytics', requirePermission('attendance.view'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, threshold = '75' } = req.query;
  const thresholdPct = parseFloat(threshold as string);

  const studentFilter: Record<string, any> = { institute_id: req.institute_id, is_deleted: false };
  if (class_id) studentFilter.class_id = class_id;
  if (section_id) studentFilter.section_id = section_id;

  const students = await repo.students.find(studentFilter);

  const studentStats = await Promise.all(
    students.map(async (s) => {
      const att = await repo.attendance.find({ student_id: s.id });
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
    })
  );

  const lowAttendanceAlerts = studentStats.filter((st) => st.isBelowThreshold && st.totalDays > 0);

  return sendSuccess(res, {
    totalStudents: students.length,
    studentStats,
    lowAttendanceAlertsCount: lowAttendanceAlerts.length,
    lowAttendanceAlerts
  });
});

// Bulk Attendance Submission API (Supports marking 30-50 students at once in a single transaction)
router.post('/bulk', requirePermission('attendance.create'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, date, records } = req.body;

  if (!class_id || !section_id || !date || !Array.isArray(records)) {
    return sendError(res, 'class_id, section_id, date, and records array are required', 400);
  }

  const dateStr = (date as string).slice(0, 10);
  let savedCount = 0;
  const absentStudentIds: string[] = [];

  for (const item of records as { student_id: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }[]) {
    // Check if record exists
    const existing = await repo.attendance.findOne({
      institute_id: req.institute_id,
      student_id: item.student_id,
      date: dateStr
    });

    const recordPayload: AttendanceRecord = {
      id: existing ? existing.id : `att-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    if (existing) {
      await repo.attendance.updateOne({ id: existing.id }, recordPayload);
    } else {
      await repo.attendance.insertOne(recordPayload);
    }

    if (item.status === 'ABSENT') {
      absentStudentIds.push(item.student_id);
    }
    savedCount++;
  }

  // Automatically trigger notifications to parents of absent students
  for (const stdId of absentStudentIds) {
    const student = await repo.students.findOne({ id: stdId });
    if (student) {
      const parentLink = await repo.parentStudentLinks.findOne({ student_id: stdId });
      if (parentLink) {
        const parent = await repo.parents.findOne({ id: parentLink.parent_id });
        if (parent) {
          await repo.notifications.insertOne({
            institute_id: req.institute_id!,
            user_id: parent.user_id,
            title: 'Absence Alert',
            body: `Your child ${student.full_name} was marked ABSENT on ${dateStr}.`,
            type: 'ATTENDANCE',
            is_read: false,
            created_at: new Date().toISOString()
          });
        }
      }
    }
  }

  await repo.auditLogs.insertOne({
    institute_id: req.institute_id!,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    user_role: req.user!.role,
    action: 'BULK_ATTENDANCE_MARKED',
    target_resource: 'ATTENDANCE',
    target_id: `${class_id}:${section_id}`,
    ip_address: req.ip,
    metadata_json: JSON.stringify({ date: dateStr, totalMarked: savedCount, absentCount: absentStudentIds.length })
  });

  return sendSuccess(res, { savedCount, date: dateStr }, `Successfully saved attendance for ${savedCount} students`);
});

export default router;