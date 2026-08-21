import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Get Timetable Slots (by Class, Teacher, Room, or Personalized for Student/Teacher)
router.get('/', requirePermission('timetable.view'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, teacher_id, room_name } = req.query;

  const filter: Record<string, any> = { institute_id: req.institute_id };

  // Personalized view
  if (req.user?.role === 'student') {
    const student = await repo.students.findOne({ user_id: req.user.id });
    if (student) {
      filter.class_id = student.class_id;
      filter.section_id = student.section_id;
    }
  } else if (req.user?.role === 'teacher') {
    filter.teacher_id = req.user?.id;
  } else {
    if (class_id) filter.class_id = class_id;
    if (section_id) filter.section_id = section_id;
    if (teacher_id) filter.teacher_id = teacher_id;
    if (room_name) filter.room_name = room_name;
  }

  const slots = await repo.timetableSlots.find(filter);

  const populated = await Promise.all(
    slots.map(async (s) => {
      const subject = await repo.subjects.findOne({ id: s.subject_id });
      const teacher = await repo.users.findOne({ id: s.teacher_id });
      const cls = await repo.classes.findOne({ id: s.class_id });
      const sec = await repo.sections.findOne({ id: s.section_id });
      return {
        ...s,
        subjectName: subject?.name,
        subjectCode: subject?.code,
        teacherName: teacher?.full_name,
        className: cls?.name,
        sectionName: sec?.name
      };
    })
  );

  return sendSuccess(res, populated);
});

// Create Timetable Slot with Conflict Detection
router.post('/', requirePermission('timetable.manage'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, day_of_week, start_time, end_time, subject_id, teacher_id, room_name } = req.body;

  if (!class_id || !day_of_week || !start_time || !end_time || !teacher_id || !room_name) {
    return sendError(res, 'class_id, day_of_week, start_time, end_time, teacher_id, and room_name required', 400);
  }

  // 1. Conflict Detection: Teacher Double Booking
  const teacherConflict = await repo.timetableSlots.findOne({
    institute_id: req.institute_id,
    teacher_id,
    day_of_week,
    start_time
  });
  if (teacherConflict) {
    return sendError(
      res,
      `Conflict detected: Teacher is already assigned to another class in room ${teacherConflict.room_name} at ${start_time} on ${day_of_week}`,
      409,
      'TEACHER_CONFLICT'
    );
  }

  // 2. Conflict Detection: Room Double Booking
  const roomConflict = await repo.timetableSlots.findOne({
    institute_id: req.institute_id,
    room_name: { $regex: `^${escapeRegex(room_name)}$`, $options: 'i' },
    day_of_week,
    start_time
  });
  if (roomConflict) {
    return sendError(
      res,
      `Conflict detected: Room '${room_name}' is already occupied at ${start_time} on ${day_of_week}`,
      409,
      'ROOM_CONFLICT'
    );
  }

  // 3. Conflict Detection: Class/Section Double Booking
  const classConflict = await repo.timetableSlots.findOne({
    institute_id: req.institute_id,
    class_id,
    section_id,
    day_of_week,
    start_time
  });
  if (classConflict) {
    return sendError(
      res,
      `Conflict detected: Class/Section already has a lecture scheduled at ${start_time} on ${day_of_week}`,
      409,
      'CLASS_CONFLICT'
    );
  }

  const newSlot = await repo.timetableSlots.insertOne({
    institute_id: req.institute_id!,
    class_id,
    section_id: section_id || '',
    day_of_week,
    start_time,
    end_time,
    subject_id,
    teacher_id,
    room_name
  });

  return sendSuccess(res, newSlot, 'Timetable slot created with zero scheduling conflicts', 201);
});

export default router;