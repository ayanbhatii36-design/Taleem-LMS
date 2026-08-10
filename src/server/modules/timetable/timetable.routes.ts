import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { TimetableSlotEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Get Timetable Slots (by Class, Teacher, Room, or Personalized for Student/Teacher)
router.get('/', requirePermission('timetable.view'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, teacher_id, room_name } = req.query;

  let slots = db.timetableSlots.filter((s) => s.institute_id === req.institute_id);

  // Personalized view
  if (req.user?.role === 'student') {
    const student = db.findStudentByUserId(req.user.id);
    if (student) {
      slots = slots.filter((s) => s.class_id === student.class_id && s.section_id === student.section_id);
    }
  } else if (req.user?.role === 'teacher') {
    slots = slots.filter((s) => s.teacher_id === req.user?.id);
  } else {
    if (class_id) slots = slots.filter((s) => s.class_id === class_id);
    if (section_id) slots = slots.filter((s) => s.section_id === section_id);
    if (teacher_id) slots = slots.filter((s) => s.teacher_id === teacher_id);
    if (room_name) slots = slots.filter((s) => s.room_name === room_name);
  }

  const populated = slots.map((s) => {
    const subject = db.subjects.find((sb) => sb.id === s.subject_id);
    const teacher = db.users.find((u) => u.id === s.teacher_id);
    const cls = db.classes.find((c) => c.id === s.class_id);
    const sec = db.sections.find((sec) => sec.id === s.section_id);
    return {
      ...s,
      subjectName: subject?.name,
      subjectCode: subject?.code,
      teacherName: teacher?.full_name,
      className: cls?.name,
      sectionName: sec?.name
    };
  });

  return sendSuccess(res, populated);
});

// Create Timetable Slot with Conflict Detection
router.post('/', requirePermission('timetable.manage'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, day_of_week, start_time, end_time, subject_id, teacher_id, room_name } = req.body;

  if (!class_id || !day_of_week || !start_time || !end_time || !teacher_id || !room_name) {
    return sendError(res, 'class_id, day_of_week, start_time, end_time, teacher_id, and room_name required', 400);
  }

  // 1. Conflict Detection: Teacher Double Booking
  const teacherConflict = db.timetableSlots.find(
    (s) =>
      s.institute_id === req.institute_id &&
      s.teacher_id === teacher_id &&
      s.day_of_week === day_of_week &&
      s.start_time === start_time
  );
  if (teacherConflict) {
    return sendError(
      res,
      `Conflict detected: Teacher is already assigned to another class in room ${teacherConflict.room_name} at ${start_time} on ${day_of_week}`,
      409,
      'TEACHER_CONFLICT'
    );
  }

  // 2. Conflict Detection: Room Double Booking
  const roomConflict = db.timetableSlots.find(
    (s) =>
      s.institute_id === req.institute_id &&
      s.room_name.toLowerCase() === room_name.toLowerCase() &&
      s.day_of_week === day_of_week &&
      s.start_time === start_time
  );
  if (roomConflict) {
    return sendError(
      res,
      `Conflict detected: Room '${room_name}' is already occupied at ${start_time} on ${day_of_week}`,
      409,
      'ROOM_CONFLICT'
    );
  }

  // 3. Conflict Detection: Class/Section Double Booking
  const classConflict = db.timetableSlots.find(
    (s) =>
      s.institute_id === req.institute_id &&
      s.class_id === class_id &&
      s.section_id === section_id &&
      s.day_of_week === day_of_week &&
      s.start_time === start_time
  );
  if (classConflict) {
    return sendError(
      res,
      `Conflict detected: Class/Section already has a lecture scheduled at ${start_time} on ${day_of_week}`,
      409,
      'CLASS_CONFLICT'
    );
  }

  const newSlot: TimetableSlotEntity = {
    id: `slot-${Date.now()}`,
    institute_id: req.institute_id!,
    class_id,
    section_id: section_id || '',
    day_of_week,
    start_time,
    end_time,
    subject_id,
    teacher_id,
    room_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.timetableSlots.push(newSlot);
  return sendSuccess(res, newSlot, 'Timetable slot created with zero scheduling conflicts', 201);
});

export default router;
