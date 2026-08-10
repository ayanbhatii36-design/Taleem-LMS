import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { ExamEntity, ExamSubjectEntity, GradeRecordEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// List Exams
router.get('/', requirePermission('exam.view'), (req: AuthenticatedRequest, res) => {
  const exams = db.exams.filter((e) => e.institute_id === req.institute_id);
  const populated = exams.map((ex) => {
    const subjects = db.examSubjects.filter((es) => es.exam_id === ex.id);
    return { ...ex, examSubjects: subjects };
  });
  return sendSuccess(res, populated);
});

// Create Exam Schedule
router.post('/', requirePermission('exam.create'), (req: AuthenticatedRequest, res) => {
  const { title, term_id, academic_year_id, start_date, end_date } = req.body;
  if (!title || !term_id || !start_date || !end_date) {
    return sendError(res, 'Title, term_id, start_date, and end_date required', 400);
  }

  const newExam: ExamEntity = {
    id: `exm-${Date.now()}`,
    institute_id: req.institute_id!,
    term_id,
    academic_year_id: academic_year_id || db.academicYears[0]?.id || 'ay-01',
    title,
    start_date,
    end_date,
    status: 'SCHEDULED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.exams.push(newExam);
  return sendSuccess(res, newExam, 'Exam scheduled successfully', 201);
});

// Add Subject to Exam
router.post('/:id/subjects', requirePermission('exam.create'), (req: AuthenticatedRequest, res) => {
  const exam = db.exams.find((e) => e.id === req.params.id && e.institute_id === req.institute_id);
  if (!exam) return sendError(res, 'Exam not found', 404);

  const { class_id, section_id, subject_id, exam_date, start_time, total_marks, passing_marks, room_name } = req.body;

  const newSub: ExamSubjectEntity = {
    id: `exm-sub-${Date.now()}`,
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
    room_name: room_name || 'Main Hall',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.examSubjects.push(newSub);
  return sendSuccess(res, newSub, 'Subject added to exam timetable', 201);
});

// Bulk Enter Grades into Gradebook
router.post('/subjects/:examSubjectId/grades/bulk', requirePermission('grades.create'), (req: AuthenticatedRequest, res) => {
  const examSub = db.examSubjects.find((es) => es.id === req.params.examSubjectId && es.institute_id === req.institute_id);
  if (!examSub) return sendError(res, 'Exam subject entry not found', 404);

  const { grades } = req.body; // Array of { student_id, marks_obtained, remarks }
  if (!Array.isArray(grades)) return sendError(res, 'grades array required', 400);

  const institute = db.institutes.find((i) => i.id === req.institute_id);
  let updatedCount = 0;

  grades.forEach((g: { student_id: string; marks_obtained: number; remarks?: string }) => {
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

    const existingIdx = db.gradeRecords.findIndex(
      (gr) => gr.exam_subject_id === examSub.id && gr.student_id === g.student_id
    );

    const record: GradeRecordEntity = {
      id: existingIdx >= 0 ? db.gradeRecords[existingIdx].id : `grd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
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

    if (existingIdx >= 0) {
      // Audit log old vs new
      const old = db.gradeRecords[existingIdx];
      db.logAudit(
        req.institute_id!,
        req.user!.id,
        req.user!.full_name,
        req.user!.role,
        'UPDATE_GRADE',
        'GRADE_RECORD',
        old.id,
        req.ip,
        { oldMarks: old.marks_obtained, newMarks: marks, student_id: g.student_id }
      );
      db.gradeRecords[existingIdx] = record;
    } else {
      db.gradeRecords.push(record);
    }
    updatedCount++;
  });

  return sendSuccess(res, { updatedCount }, `Grades updated for ${updatedCount} students`);
});

// View Grades for class or student
router.get('/grades', requirePermission('grades.view'), (req: AuthenticatedRequest, res) => {
  const { student_id, exam_id, class_id } = req.query;

  let records = db.gradeRecords.filter((gr) => gr.institute_id === req.institute_id);

  if (req.user?.role === 'student') {
    const student = db.findStudentByUserId(req.user.id);
    if (student) records = records.filter((r) => r.student_id === student.id);
  } else if (req.user?.role === 'parent') {
    const parent = db.findParentByUserId(req.user.id);
    const children = parent ? db.getChildrenForParent(parent.id) : [];
    const childIds = children.map((c) => c.id);
    records = records.filter((r) => childIds.includes(r.student_id));
  } else if (student_id) {
    records = records.filter((r) => r.student_id === student_id);
  }

  const populated = records.map((gr) => {
    const examSub = db.examSubjects.find((es) => es.id === gr.exam_subject_id);
    const subject = db.subjects.find((s) => s.id === examSub?.subject_id);
    const student = db.students.find((st) => st.id === gr.student_id);
    return {
      ...gr,
      subjectName: subject?.name || 'Subject',
      studentName: student?.full_name,
      rollNo: student?.roll_no
    };
  });

  return sendSuccess(res, populated);
});

export default router;
