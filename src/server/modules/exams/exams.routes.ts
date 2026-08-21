import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { GradeRecordEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Exams
router.get('/', requirePermission('exam.view'), async (req: AuthenticatedRequest, res) => {
  const exams = await repo.exams.find({ institute_id: req.institute_id });
  const populated = await Promise.all(
    exams.map(async (ex) => {
      const subjects = await repo.examSubjects.find({ exam_id: ex.id });
      return { ...ex, examSubjects: subjects };
    })
  );
  return sendSuccess(res, populated);
});

// Create Exam Schedule
router.post('/', requirePermission('exam.create'), async (req: AuthenticatedRequest, res) => {
  const { title, term_id, academic_year_id, start_date, end_date } = req.body;
  if (!title || !term_id || !start_date || !end_date) {
    return sendError(res, 'Title, term_id, start_date, and end_date required', 400);
  }

  const firstAcademicYear = await repo.academicYears.findOne({});
  const newExam = await repo.exams.insertOne({
    institute_id: req.institute_id!,
    term_id,
    academic_year_id: academic_year_id || firstAcademicYear?.id || 'ay-01',
    title,
    start_date,
    end_date,
    status: 'SCHEDULED'
  });

  return sendSuccess(res, newExam, 'Exam scheduled successfully', 201);
});

// Add Subject to Exam
router.post('/:id/subjects', requirePermission('exam.create'), async (req: AuthenticatedRequest, res) => {
  const exam = await repo.exams.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!exam) return sendError(res, 'Exam not found', 404);

  const { class_id, section_id, subject_id, exam_date, start_time, total_marks, passing_marks, room_name } = req.body;

  const newSub = await repo.examSubjects.insertOne({
    institute_id: req.institute_id!,
    exam_id: exam.id,
    class_id,
    section_id,
    subject_id,
    exam_date: exam_date || exam.start_date,
    start_time: start_time || '09:00',
    duration_minutes: 180,
    total_marks: total_marks || 100,
    passing_marks: passing_marks || 33,
    room_name: room_name || 'Main Hall'
  });

  return sendSuccess(res, newSub, 'Subject added to exam timetable', 201);
});

// Bulk Enter Grades into Gradebook
router.post('/subjects/:examSubjectId/grades/bulk', requirePermission('grades.create'), async (req: AuthenticatedRequest, res) => {
  const examSub = await repo.examSubjects.findOne({ id: req.params.examSubjectId, institute_id: req.institute_id });
  if (!examSub) return sendError(res, 'Exam subject entry not found', 404);

  const { grades } = req.body; // Array of { student_id, marks_obtained, remarks }
  if (!Array.isArray(grades)) return sendError(res, 'grades array required', 400);

  await repo.institutes.findOne({ id: req.institute_id });
  let updatedCount = 0;

  for (const g of grades as { student_id: string; marks_obtained: number; remarks?: string }[]) {
    const marks = parseFloat(g.marks_obtained as any) || 0;
    const pct = (marks / examSub.total_marks) * 100;

    // Calculate letter grade & GPA
    let grade_letter = 'F';
    let gpa_points = 0.0;
    if (pct >= 80) { grade_letter = 'A1'; gpa_points = 4.0; }
    else if (pct >= 70) { grade_letter = 'A'; gpa_points = 3.7; }
    else if (pct >= 60) { grade_letter = 'B'; gpa_points = 3.0; }
    else if (pct >= 50) { grade_letter = 'C'; gpa_points = 2.0; }
    else if (pct >= 40) { grade_letter = 'D'; gpa_points = 1.0; }

    const existing = await repo.gradeRecords.findOne({
      exam_subject_id: examSub.id,
      student_id: g.student_id
    });

    const record: GradeRecordEntity = {
      id: existing ? existing.id : `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      institute_id: req.institute_id!,
      exam_subject_id: examSub.id,
      student_id: g.student_id,
      marks_obtained: marks,
      total_marks: examSub.total_marks,
      grade_letter,
      gpa_points,
      remarks: g.remarks || '',
      entered_by_user_id: req.user!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (existing) {
      // Audit log old vs new
      await repo.auditLogs.insertOne({
        institute_id: req.institute_id!,
        user_id: req.user!.id,
        user_name: req.user!.full_name,
        user_role: req.user!.role,
        action: 'UPDATE_GRADE',
        target_resource: 'GRADE_RECORD',
        target_id: existing.id,
        ip_address: req.ip,
        metadata_json: JSON.stringify({ oldMarks: existing.marks_obtained, newMarks: marks, student_id: g.student_id })
      });
      await repo.gradeRecords.updateOne({ id: existing.id }, record);
    } else {
      await repo.gradeRecords.insertOne(record);
    }
    updatedCount++;
  }

  return sendSuccess(res, { updatedCount }, `Grades updated for ${updatedCount} students`);
});

// View Grades for class or student
router.get('/grades', requirePermission('grades.view'), async (req: AuthenticatedRequest, res) => {
  const { student_id, exam_id, class_id } = req.query;

  const filter: Record<string, any> = { institute_id: req.institute_id };

  if (req.user?.role === 'student') {
    const student = await repo.students.findOne({ user_id: req.user.id });
    if (student) filter.student_id = student.id;
  } else if (req.user?.role === 'parent') {
    const parent = await repo.parents.findOne({ user_id: req.user.id });
    const links = parent ? await repo.parentStudentLinks.find({ parent_id: parent.id }) : [];
    const childIds = links.map((l) => l.student_id);
    filter.student_id = { $in: childIds };
  } else if (student_id) {
    filter.student_id = student_id;
  }

  const records = await repo.gradeRecords.find(filter);

  const populated = await Promise.all(
    records.map(async (gr) => {
      const examSub = await repo.examSubjects.findOne({ id: gr.exam_subject_id });
      const subject = examSub ? await repo.subjects.findOne({ id: examSub.subject_id }) : null;
      const student = await repo.students.findOne({ id: gr.student_id });
      return {
        ...gr,
        subjectName: subject?.name || 'Subject',
        studentName: student?.full_name,
        rollNo: student?.roll_no
      };
    })
  );

  return sendSuccess(res, populated);
});

export default router;