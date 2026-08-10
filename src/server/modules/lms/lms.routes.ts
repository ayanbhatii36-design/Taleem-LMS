import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { AssignmentEntity, SubmissionEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Get Assignments
router.get('/assignments', requirePermission('lms.view'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, course_id } = req.query;

  let assignments = db.assignments.filter((a) => a.institute_id === req.institute_id);
  if (class_id) assignments = assignments.filter((a) => a.class_id === class_id);
  if (section_id) assignments = assignments.filter((a) => a.section_id === section_id);
  if (course_id) assignments = assignments.filter((a) => a.course_id === course_id);

  const populated = assignments.map((asg) => {
    const submissions = db.submissions.filter((s) => s.assignment_id === asg.id);
    return {
      ...asg,
      submissionCount: submissions.length
    };
  });

  return sendSuccess(res, populated);
});

// Create Assignment
router.post('/assignments', requirePermission('lms.create'), (req: AuthenticatedRequest, res) => {
  const { title, description, class_id, section_id, subject_id, course_id, due_date, total_marks, allowed_file_types } = req.body;

  if (!title || !class_id || !section_id || !due_date) {
    return sendError(res, 'Title, class_id, section_id, and due_date are required', 400);
  }

  const newAsg: AssignmentEntity = {
    id: `asg-${Date.now()}`,
    institute_id: req.institute_id!,
    course_id: course_id || '',
    class_id,
    section_id,
    subject_id: subject_id || '',
    teacher_id: req.user!.id,
    title,
    description: description || '',
    due_date,
    total_marks: total_marks || 100,
    allowed_file_types: allowed_file_types || ['pdf', 'docx', 'jpg'],
    max_file_size_mb: 15,
    allow_late_submission: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.assignments.push(newAsg);
  return sendSuccess(res, newAsg, 'Assignment published successfully', 201);
});

// Submit Assignment (Student)
router.post('/assignments/:id/submit', requirePermission('assignment.submit'), (req: AuthenticatedRequest, res) => {
  const assignment = db.assignments.find((a) => a.id === req.params.id && a.institute_id === req.institute_id);
  if (!assignment) return sendError(res, 'Assignment not found', 404);

  const student = db.findStudentByUserId(req.user!.id);
  if (!student && req.user!.role !== 'super_admin') {
    return sendError(res, 'Student profile required to submit assignment', 403);
  }

  const { file_url, file_name, file_type, notes } = req.body;
  if (!file_url || !file_name) {
    return sendError(res, 'file_url and file_name required', 400);
  }

  const isLate = new Date() > new Date(assignment.due_date);

  const submission: SubmissionEntity = {
    id: `sub-${Date.now()}`,
    institute_id: req.institute_id!,
    assignment_id: assignment.id,
    student_id: student ? student.id : req.body.student_id,
    submission_date: new Date().toISOString(),
    file_url,
    file_name,
    file_type: file_type || 'application/pdf',
    notes: notes || '',
    status: isLate ? 'LATE' : 'SUBMITTED',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.submissions.push(submission);
  return sendSuccess(res, submission, 'Assignment submitted successfully', 201);
});

// Grade Submission (Teacher)
router.post('/submissions/:id/grade', requirePermission('assignment.grade'), (req: AuthenticatedRequest, res) => {
  const sub = db.submissions.find((s) => s.id === req.params.id && s.institute_id === req.institute_id);
  if (!sub) return sendError(res, 'Submission not found', 404);

  const { grade_obtained, feedback } = req.body;
  if (grade_obtained === undefined) return sendError(res, 'grade_obtained is required', 400);

  sub.grade_obtained = parseFloat(grade_obtained);
  sub.feedback = feedback || '';
  sub.status = 'GRADED';
  sub.graded_by_user_id = req.user!.id;
  sub.graded_at = new Date().toISOString();
  sub.updated_at = new Date().toISOString();

  return sendSuccess(res, sub, 'Submission graded successfully');
});

export default router;
