import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db/database';
import { comparePassword, hashPassword, validatePasswordStrength } from '../../utils/password';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { ROLE_PERMISSIONS, SECURITY_CONFIG } from '../../config/constants';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone required'),
  password: z.string().min(1, 'Password required'),
  instituteCode: z.string().optional()
});

// Login (email/password or phone/password)
router.post('/login', createRateLimiter(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    
    // Find user by email or phone
    let user = db.users.find(
      (u) =>
        !u.is_deleted &&
        (u.email.toLowerCase() === body.emailOrPhone.toLowerCase() || u.phone === body.emailOrPhone)
    );

    if (!user) {
      return sendError(res, 'Invalid credentials or user not found', 401, 'INVALID_CREDENTIALS');
    }

    // Lockout check
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return sendError(
        res,
        'Account locked due to consecutive failed login attempts. Please try again later.',
        423,
        'ACCOUNT_LOCKED'
      );
    }

    // Verify password
    const passwordMatch = await comparePassword(body.password, user.password_hash);
    if (!passwordMatch) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        user.lockout_until = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
      }
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts
    user.failed_login_attempts = 0;
    user.lockout_until = null;
    user.last_login_at = new Date().toISOString();

    const institute = db.institutes.find((i) => i.id === user?.institute_id);
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    const userPayload = {
      id: user.id,
      institute_id: user.institute_id,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      role: user.role,
      permissions,
      institute_name: institute?.name
    };

    const tokens = generateTokens(userPayload);

    db.logAudit(user.institute_id, user.id, user.full_name, user.role, 'LOGIN_SUCCESS', 'AUTH', user.id, req.ip);

    return sendSuccess(
      res,
      {
        user: userPayload,
        token: tokens.token,
        refreshToken: tokens.refreshToken
      },
      'Login successful'
    );
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.errors);
    }
    return sendError(res, err.message || 'Login failed', 500);
  }
});

// Refresh Token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token required', 400, 'MISSING_REFRESH_TOKEN');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = db.findUserById(decoded.userId);
    if (!user || !user.is_active) {
      return sendError(res, 'User not active', 401, 'UNAUTHORIZED');
    }

    const institute = db.institutes.find((i) => i.id === user.institute_id);
    const permissions = ROLE_PERMISSIONS[user.role] || [];

    const userPayload = {
      id: user.id,
      institute_id: user.institute_id,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      role: user.role,
      permissions,
      institute_name: institute?.name
    };

    const tokens = generateTokens(userPayload);
    return sendSuccess(res, tokens, 'Token refreshed successfully');
  } catch (err: any) {
    return sendError(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
});

// Get Current Profile
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (!req.user) return sendError(res, 'Unauthorized', 401);
  const user = db.findUserById(req.user.id);
  if (!user) return sendError(res, 'User not found', 404);

  const institute = db.institutes.find((i) => i.id === user.institute_id);
  
  // Extra role-specific entity
  let profileDetails = {};
  if (user.role === 'student') {
    profileDetails = { student: db.findStudentByUserId(user.id) };
  } else if (user.role === 'teacher') {
    profileDetails = { teacher: db.findTeacherByUserId(user.id) };
  } else if (user.role === 'parent') {
    const parent = db.findParentByUserId(user.id);
    const children = parent ? db.getChildrenForParent(parent.id) : [];
    profileDetails = { parent, children };
  }

  return sendSuccess(
    res,
    {
      user: {
        ...req.user,
        avatar_url: user.avatar_url,
        last_login_at: user.last_login_at
      },
      institute,
      profileDetails
    },
    'User profile retrieved'
  );
});

// Password Reset Request & Reset
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  if (!email || !newPassword) {
    return sendError(res, 'Email and new password required', 400);
  }

  const val = validatePasswordStrength(newPassword);
  if (!val.valid) {
    return sendError(res, val.reason || 'Weak password', 400, 'WEAK_PASSWORD');
  }

  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && !u.is_deleted);
  if (!user) {
    return sendError(res, 'User with provided email not found', 404);
  }

  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date().toISOString();

  db.logAudit(user.institute_id, user.id, user.full_name, user.role, 'PASSWORD_RESET', 'AUTH', user.id, req.ip);

  return sendSuccess(res, null, 'Password reset successfully. You can now log in.');
});

// Logout
router.post('/logout', authenticateJWT, (req: AuthenticatedRequest, res) => {
  if (req.user) {
    db.logAudit(req.user.institute_id, req.user.id, req.user.full_name, req.user.role, 'LOGOUT', 'AUTH', req.user.id, req.ip);
  }
  return sendSuccess(res, null, 'Logged out successfully');
});

export default router;
