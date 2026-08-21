import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// --- ACADEMIC YEARS ---
router.get('/years', async (req: AuthenticatedRequest, res) => {
  const years = await repo.academicYears.find({ institute_id: req.institute_id });
  return sendSuccess(res, years);
});

router.post('/years', requirePermission('academics.manage'), async (req: AuthenticatedRequest, res) => {
  const { name, start_date, end_date, is_current } = req.body;
  if (!name || !start_date || !end_date) {
    return sendError(res, 'Name, start_date, and end_date are required', 400);
  }

  if (is_current) {
    await repo.academicYears.updateMany({ institute_id: req.institute_id }, { is_current: false });
  }

  const newAy = {
    id: `ay-${Date.now()}`,
    institute_id: req.institute_id!,
    name,
    start_date,
    end_date,
    is_current: !!is_current,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.academicYears.insertOne(newAy);
  return sendSuccess(res, created, 'Academic year created', 201);
});

// --- TERMS ---
router.get('/terms', async (req: AuthenticatedRequest, res) => {
  const terms = await repo.terms.find({ institute_id: req.institute_id });
  return sendSuccess(res, terms);
});

router.post('/terms', requirePermission('academics.manage'), async (req: AuthenticatedRequest, res) => {
  const { academic_year_id, name, start_date, end_date } = req.body;
  if (!academic_year_id || !name) {
    return sendError(res, 'academic_year_id and name required', 400);
  }

  const newTerm = {
    id: `t-${Date.now()}`,
    institute_id: req.institute_id!,
    academic_year_id,
    name,
    start_date: start_date || new Date().toISOString().slice(0, 10),
    end_date: end_date || new Date().toISOString().slice(0, 10),
    is_current: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.terms.insertOne(newTerm);
  return sendSuccess(res, created, 'Academic term created', 201);
});

// --- CLASSES & SECTIONS ---
router.get('/classes', async (req: AuthenticatedRequest, res) => {
  const classes = await repo.classes.find({ institute_id: req.institute_id });
  const sections = await repo.sections.find({ institute_id: req.institute_id });

  const populated = classes.map((cls) => ({
    ...cls,
    sections: sections.filter((sec) => sec.class_id === cls.id)
  }));

  return sendSuccess(res, populated);
});

router.post('/classes', requirePermission('academics.manage'), async (req: AuthenticatedRequest, res) => {
  const { name, code, level_order } = req.body;
  if (!name || !code) return sendError(res, 'Name and code required', 400);

  const newClass = {
    id: `cls-${Date.now()}`,
    institute_id: req.institute_id!,
    name,
    code,
    level_order: level_order || 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.classes.insertOne(newClass);
  return sendSuccess(res, created, 'Class created', 201);
});

router.post('/sections', requirePermission('academics.manage'), async (req: AuthenticatedRequest, res) => {
  const { class_id, name, capacity, class_teacher_id } = req.body;
  if (!class_id || !name) return sendError(res, 'class_id and name required', 400);

  const newSection = {
    id: `sec-${Date.now()}`,
    institute_id: req.institute_id!,
    class_id,
    name,
    capacity: capacity || 40,
    class_teacher_id,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.sections.insertOne(newSection);
  return sendSuccess(res, created, 'Section created', 201);
});

// --- SUBJECTS & COURSES ---
router.get('/subjects', async (req: AuthenticatedRequest, res) => {
  const subjects = await repo.subjects.find({ institute_id: req.institute_id });
  return sendSuccess(res, subjects);
});

router.post('/subjects', requirePermission('academics.manage'), async (req: AuthenticatedRequest, res) => {
  const { name, code, type, credit_hours } = req.body;
  if (!name || !code) return sendError(res, 'Name and code required', 400);

  const newSubject = {
    id: `sbj-${Date.now()}`,
    institute_id: req.institute_id!,
    name,
    code,
    type: type || 'THEORY',
    credit_hours: credit_hours || 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const created = await repo.subjects.insertOne(newSubject);
  return sendSuccess(res, created, 'Subject created', 201);
});

router.get('/courses', async (req: AuthenticatedRequest, res) => {
  const courses = await repo.courses.find({ institute_id: req.institute_id });
  return sendSuccess(res, courses);
});

export default router;
