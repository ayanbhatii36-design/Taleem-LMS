import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { AnnouncementEntity, MessageEntity, NotificationEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// --- ANNOUNCEMENTS ---
router.get('/announcements', requirePermission('announcement.view'), (req: AuthenticatedRequest, res) => {
  let announcements = db.announcements.filter((a) => a.institute_id === req.institute_id);

  if (req.user?.role !== 'super_admin' && req.user?.role !== 'principal') {
    announcements = announcements.filter(
      (a) => a.target_roles.includes('All' as any) || a.target_roles.includes(req.user!.role)
    );
  }

  return sendSuccess(res, announcements);
});

router.post('/announcements', requirePermission('announcement.create'), (req: AuthenticatedRequest, res) => {
  const { title, content, target_roles, priority } = req.body;
  if (!title || !content) {
    return sendError(res, 'Title and content required', 400);
  }

  const newAnc: AnnouncementEntity = {
    id: `anc-${Date.now()}`,
    institute_id: req.institute_id!,
    title,
    content,
    target_roles: target_roles || ['student', 'teacher', 'parent', 'administrator'],
    priority: priority || 'NORMAL',
    author_id: req.user!.id,
    author_name: req.user!.full_name,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.announcements.unshift(newAnc);
  return sendSuccess(res, newAnc, 'Announcement published', 201);
});

// --- MESSAGES ---
router.get('/messages', requirePermission('message.view'), (req: AuthenticatedRequest, res) => {
  const messages = db.messages.filter(
    (m) =>
      m.institute_id === req.institute_id &&
      (m.sender_id === req.user!.id || m.recipient_id === req.user!.id || m.recipient_id === 'all')
  );

  return sendSuccess(res, messages);
});

router.post('/messages', requirePermission('message.send'), (req: AuthenticatedRequest, res) => {
  const { recipient_id, content, conversation_id } = req.body;
  if (!content) return sendError(res, 'Content required', 400);

  const convId = conversation_id || `conv-${[req.user!.id, recipient_id || 'general'].sort().join('-')}`;

  const newMsg: MessageEntity = {
    id: `msg-${Date.now()}`,
    institute_id: req.institute_id!,
    conversation_id: convId,
    sender_id: req.user!.id,
    recipient_id: recipient_id || 'all',
    content,
    is_read: false,
    created_at: new Date().toISOString()
  };

  db.messages.push(newMsg);
  return sendSuccess(res, newMsg, 'Message sent', 201);
});

// --- NOTIFICATIONS ---
router.get('/notifications', (req: AuthenticatedRequest, res) => {
  const notifs = db.notifications.filter(
    (n) => n.institute_id === req.institute_id && n.user_id === req.user!.id
  );
  return sendSuccess(res, notifs);
});

router.put('/notifications/mark-read', (req: AuthenticatedRequest, res) => {
  db.notifications.forEach((n) => {
    if (n.institute_id === req.institute_id && n.user_id === req.user!.id) {
      n.is_read = true;
    }
  });
  return sendSuccess(res, null, 'Notifications marked as read');
});

export default router;
