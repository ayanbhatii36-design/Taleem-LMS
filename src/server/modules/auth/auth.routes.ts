import { Router } from 'express';
import { z } from 'zod';
import { repo } from '../../db/repository';
import { comparePassword, hashPassword, validatePasswordStrength } from '../../utils/password';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { ROLE_PERMISSIONS, SECURITY_CONFIG } from '../../config/constants';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { User } from '../../types/backend';

const router = Router();

const loginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone required'),
  password: z.string().min(1, 'Password required'),
  instituteCode: z.string().optional()
});

const registerSchema = z.object({
  full_name: z.string().min(2, 'Full name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().min(10, 'A valid phone number is required'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['principal', 'teacher', 'student', 'parent']),
  instituteCode: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  dob: z.string().optional(),
  guardian_name: z.string().optional(),
  guardian_phone: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional()
});

// Login (email/password or phone/password)
router.post('/login', createRateLimiter(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    // Find user by email or phone
    let user = await repo.users.findOne({
      $or: [
        { email: body.emailOrPhone.toLowerCase() },
        { phone: body.emailOrPhone }
      ]
    });

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
      const attempts = (user.failed_login_attempts || 0) + 1;
      const update: any = { failed_login_attempts: attempts };
      if (attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        update.lockout_until = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60 * 1000).toISOString();
      }
      await repo.users.updateOne({ id: user.id }, update);
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Reset failed attempts
    await repo.users.updateOne(
      { id: user.id },
      { failed_login_attempts: 0, lockout_until: null, last_login_at: new Date().toISOString() }
    );
    user = (await repo.users.findOne({ id: user.id })) || user;

    const institute = await repo.institutes.findOne({ id: user.institute_id });
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

    await repo.auditLogs.insertOne({
      institute_id: user.institute_id,
      user_id: user.id,
      user_name: user.full_name,
      user_role: user.role,
      action: 'LOGIN_SUCCESS',
      target_resource: 'AUTH',
      target_id: user.id,
      ip_address: req.ip,
      metadata_json: JSON.stringify({ path: req.originalUrl, method: req.method })
    });

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

// Register (multi-role signup with auto-login)
router.post('/register', createRateLimiter(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);

    const val = validatePasswordStrength(body.password);
    if (!val.valid) {
      return sendError(res, val.reason || 'Weak password', 400, 'WEAK_PASSWORD');
    }

    const email = body.email.toLowerCase();
    const existing = await repo.users.findOne({ $or: [{ email }, { phone: body.phone }] });
    if (existing) {
      return sendError(res, 'An account with this email or phone already exists', 409, 'ACCOUNT_EXISTS');
    }

    // Resolve institute: by code if provided, otherwise the default/primary tenant
    let institute = body.instituteCode
      ? await repo.institutes.findOne({ code: body.instituteCode })
      : null;
    if (!institute) {
      const all = await repo.institutes.find({});
      institute = all[0] || null;
    }
    if (!institute) {
      return sendError(res, 'No institute is configured yet. Please contact support.', 500, 'NO_INSTITUTE');
    }

    const now = new Date().toISOString();
    const userId = `usr-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
    const user: User = {
      id: userId,
      institute_id: institute.id,
      email,
      phone: body.phone,
      password_hash: await hashPassword(body.password),
      full_name: body.full_name,
      role: body.role,
      is_active: true,
      is_email_verified: false,
      is_phone_verified: false,
      two_factor_enabled: false,
      failed_login_attempts: 0,
      created_at: now,
      updated_at: now
    };
    await repo.users.insertOne(user);

    // Create role-specific profile records
    if (body.role === 'teacher') {
      await repo.teachers.insertOne({
        id: `tch-${Date.now()}`,
        institute_id: institute.id,
        user_id: userId,
        emp_id: `TCH-${Math.floor(1000 + Math.random() * 9000)}`,
        full_name: body.full_name,
        designation: body.designation || 'Lecturer',
        qualification: body.qualification || '',
        specialization: '',
        joining_date: now.slice(0, 10),
        status: 'ACTIVE',
        created_at: now,
        updated_at: now
      });
    } else if (body.role === 'student') {
      const academicYear = (await repo.academicYears.find({ institute_id: institute.id, is_current: true }))[0];
      await repo.students.insertOne({
        id: `std-${Date.now()}`,
        institute_id: institute.id,
        user_id: userId,
        registration_no: `REG-${Math.floor(1000 + Math.random() * 9000)}`,
        roll_no: String(Math.floor(1000 + Math.random() * 9000)),
        full_name: body.full_name,
        gender: body.gender || 'OTHER',
        dob: body.dob || '',
        cnic_bform: '',
        class_id: '',
        section_id: '',
        academic_year_id: academicYear?.id || '',
        guardian_name: body.guardian_name || '',
        guardian_phone: body.guardian_phone || body.phone,
        guardian_relation: 'GUARDIAN',
        address: '',
        status: 'ACTIVE',
        admission_date: now.slice(0, 10),
        created_at: now,
        updated_at: now
      });
    } else if (body.role === 'parent') {
      await repo.parents.insertOne({
        id: `prn-${Date.now()}`,
        institute_id: institute.id,
        user_id: userId,
        full_name: body.full_name,
        cnic: '',
        occupation: '',
        address: '',
        created_at: now,
        updated_at: now
      });
    }

    const permissions = ROLE_PERMISSIONS[user.role] || [];
    const userPayload = {
      id: user.id,
      institute_id: user.institute_id,
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      role: user.role,
      permissions,
      institute_name: institute.name
    };
    const tokens = generateTokens(userPayload);

    await repo.auditLogs.insertOne({
      institute_id: user.institute_id,
      user_id: user.id,
      user_name: user.full_name,
      user_role: user.role,
      action: 'REGISTER',
      target_resource: 'AUTH',
      target_id: user.id,
      ip_address: req.ip,
      metadata_json: JSON.stringify({ path: req.originalUrl, method: req.method })
    });

    return sendSuccess(
      res,
      { user: userPayload, token: tokens.token, refreshToken: tokens.refreshToken },
      'Account created successfully. You are now signed in.'
    );
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.errors);
    }
    return sendError(res, err.message || 'Registration failed', 500);
  }
});

// Refresh Token
router.post('/refresh', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return sendError(res, 'Refresh token required', 400, 'MISSING_REFRESH_TOKEN');
  }

  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = await repo.users.findOne({ id: decoded.userId });
    if (!user || !user.is_active) {
      return sendError(res, 'User not active', 401, 'UNAUTHORIZED');
    }

    const institute = await repo.institutes.findOne({ id: user.institute_id });
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
router.get('/me', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (!req.user) return sendError(res, 'Unauthorized', 401);
  const user = await repo.users.findOne({ id: req.user.id });
  if (!user) return sendError(res, 'User not found', 404);

  const institute = await repo.institutes.findOne({ id: user.institute_id });

  // Extra role-specific entity
  let profileDetails = {};
  if (user.role === 'student') {
    profileDetails = { student: await repo.students.findOne({ user_id: user.id }) };
  } else if (user.role === 'teacher') {
    profileDetails = { teacher: await repo.teachers.findOne({ user_id: user.id }) };
  } else if (user.role === 'parent') {
    const parent = await repo.parents.findOne({ user_id: user.id });
    const links = parent ? await repo.parentStudentLinks.find({ parent_id: parent.id }) : [];
    const childIds = links.map((l) => l.student_id);
    const children = childIds.length > 0 ? await repo.students.find({ id: { $in: childIds } }) : [];
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

  const user = await repo.users.findOne({ email: email.toLowerCase() });
  if (!user) {
    return sendError(res, 'User with provided email not found', 404);
  }

  await repo.users.updateOne({ id: user.id }, { password_hash: await hashPassword(newPassword) });

  await repo.auditLogs.insertOne({
    institute_id: user.institute_id,
    user_id: user.id,
    user_name: user.full_name,
    user_role: user.role,
    action: 'PASSWORD_RESET',
    target_resource: 'AUTH',
    target_id: user.id,
    ip_address: req.ip
  });

  return sendSuccess(res, null, 'Password reset successfully. You can now log in.');
});

// Logout
router.post('/logout', authenticateJWT, async (req: AuthenticatedRequest, res) => {
  if (req.user) {
    await repo.auditLogs.insertOne({
      institute_id: req.user.institute_id,
      user_id: req.user.id,
      user_name: req.user.full_name,
      user_role: req.user.role,
      action: 'LOGOUT',
      target_resource: 'AUTH',
      target_id: req.user.id,
      ip_address: req.ip
    });
  }
  return sendSuccess(res, null, 'Logged out successfully');
});

export default router;