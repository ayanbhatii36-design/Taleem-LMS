import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// --- ANNOUNCEMENTS ---
router.get('/announcements', requirePermission('announcement.view'), async (req: AuthenticatedRequest, res) => {
  let announcements = await repo.announcements.find({ institute_id: req.institute_id });

  if (req.user?.role !== 'super_admin' && req.user?.role !== 'principal') {
    announcements = announcements.filter(
      (a) => a.target_roles.includes('All' as any) || a.target_roles.includes(req.user!.role)
    );
  }

  return sendSuccess(res, announcements);
});

router.post('/announcements', requirePermission('announcement.create'), async (req: AuthenticatedRequest, res) => {
  const { title, content, target_roles, priority } = req.body;
  if (!title || !content) {
    return sendError(res, 'Title and content required', 400);
  }

  const newAnc = await repo.announcements.insertOne({
    institute_id: req.institute_id!,
    title,
    content,
    target_roles: target_roles || ['student', 'teacher', 'parent', 'administrator'],
    priority: priority || 'NORMAL',
    author_id: req.user!.id,
    author_name: req.user!.full_name
  });

  return sendSuccess(res, newAnc, 'Announcement published', 201);
});

// --- MESSAGES ---
router.get('/messages', requirePermission('message.view'), async (req: AuthenticatedRequest, res) => {
  const messages = await repo.messages.find({
    institute_id: req.institute_id,
    $or: [{ sender_id: req.user!.id }, { recipient_id: req.user!.id }, { recipient_id: 'all' }]
  });

  return sendSuccess(res, messages);
});

router.post('/messages', requirePermission('message.send'), async (req: AuthenticatedRequest, res) => {
  const { recipient_id, content, conversation_id } = req.body;
  if (!content) return sendError(res, 'Content required', 400);

  const convId = conversation_id || `conv-${[req.user!.id, recipient_id || 'general'].sort().join('-')}`;

  const newMsg = await repo.messages.insertOne({
    institute_id: req.institute_id!,
    conversation_id: convId,
    sender_id: req.user!.id,
    recipient_id: recipient_id || 'all',
    content,
    is_read: false
  });

  return sendSuccess(res, newMsg, 'Message sent', 201);
});

// --- NOTIFICATIONS ---
router.get('/notifications', async (req: AuthenticatedRequest, res) => {
  const notifs = await repo.notifications.find({
    institute_id: req.institute_id,
    user_id: req.user!.id
  });
  return sendSuccess(res, notifs);
});

router.put('/notifications/mark-read', async (req: AuthenticatedRequest, res) => {
  await repo.notifications.updateMany(
    { institute_id: req.institute_id, user_id: req.user!.id },
    { is_read: true }
  );
  return sendSuccess(res, null, 'Notifications marked as read');
});

export default router;