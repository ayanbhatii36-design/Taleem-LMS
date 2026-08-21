import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { AssignmentEntity, SubmissionEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Get Assignments
router.get('/assignments', requirePermission('lms.view'), async (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, course_id } = req.query;

  const filter: any = { institute_id: req.institute_id };
  if (class_id) filter.class_id = class_id;
  if (section_id) filter.section_id = section_id;
  if (course_id) filter.course_id = course_id;

  const assignments = await repo.assignments.find(filter);

  const populated = await Promise.all(
    assignments.map(async (asg) => {
      const submissions = await repo.submissions.find({ assignment_id: asg.id });
      return {
        ...asg,
        submissionCount: submissions.length
      };
    })
  );

  return sendSuccess(res, populated);
});

// Create Assignment
router.post('/assignments', requirePermission('lms.create'), async (req: AuthenticatedRequest, res) => {
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

  const created = await repo.assignments.insertOne(newAsg);
  return sendSuccess(res, created, 'Assignment published successfully', 201);
});

// Submit Assignment (Student)
router.post('/assignments/:id/submit', requirePermission('assignment.submit'), async (req: AuthenticatedRequest, res) => {
  const assignment = await repo.assignments.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!assignment) return sendError(res, 'Assignment not found', 404);

  const student = await repo.students.findOne({ user_id: req.user!.id, is_deleted: { $ne: true } });
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

  const created = await repo.submissions.insertOne(submission);
  return sendSuccess(res, created, 'Assignment submitted successfully', 201);
});

// Grade Submission (Teacher)
router.post('/submissions/:id/grade', requirePermission('assignment.grade'), async (req: AuthenticatedRequest, res) => {
  const sub = await repo.submissions.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!sub) return sendError(res, 'Submission not found', 404);

  const { grade_obtained, feedback } = req.body;
  if (grade_obtained === undefined) return sendError(res, 'grade_obtained is required', 400);

  const updated = await repo.submissions.updateOne(
    { id: sub.id },
    {
      grade_obtained: parseFloat(grade_obtained),
      feedback: feedback || '',
      status: 'GRADED',
      graded_by_user_id: req.user!.id,
      graded_at: new Date().toISOString()
    }
  );

  return sendSuccess(res, updated, 'Submission graded successfully');
});

export default router;