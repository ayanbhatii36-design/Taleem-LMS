# Backend Development Guide — Build TaleemLMS Backend Step by Step

> A complete, hands-on guide to building the TaleemLMS backend exactly like the one in this repository (`src/server/`). It is an **Express + TypeScript** API with **JWT auth**, **RBAC**, **multi-tenant isolation**, **rate limiting**, **audit logging**, **Zod validation**, and an **in-memory relational database** (with a PostgreSQL schema ready for production).

---

## Table of Contents

1. [Step 0 — Prerequisites](#step-0--prerequisites)
2. [Step 1 — Project Setup & Dependencies](#step-1--project-setup--dependencies)
3. [Step 2 — TypeScript Configuration](#step-2--typescript-configuration)
4. [Step 3 — Backend Types (Domain Model)](#step-3--backend-types-domain-model)
5. [Step 4 — Config & Constants (RBAC + Security)](#step-4--config--constants-rbac--security)
6. [Step 5 — Utility Helpers](#step-5--utility-helpers)
7. [Step 6 — The Database Layer](#step-6--the-database-layer)
8. [Step 7 — Middleware](#step-7--middleware)
9. [Step 8 — Auth Module (Login, Refresh, Me)](#step-8--auth-module-login-refresh-me)
10. [Step 9 — Feature Modules (The Router Pattern)](#step-9--feature-modules-the-router-pattern)
11. [Step 10 — Server Bootstrap (index.ts)](#step-10--server-bootstrap-indexts)
12. [Step 11 — Seeding & Testing](#step-11--seeding--testing)
13. [Step 12 — Production Build & Deployment](#step-12--production-build--deployment)
14. [Step 13 — API Documentation (OpenAPI)](#step-13--api-documentation-openapi)
15. [Final Checklist](#final-checklist)

---

## Step 0 — Prerequisites

- **Node.js 18+** and **npm** (or **bun** — the repo ships a `bun.lock`).
- Basic knowledge of TypeScript and Express.
- Optional: **PostgreSQL 14+** if you want to switch from the in-memory DB to a real database.

---

## Step 1 — Project Setup & Dependencies

Create the project and install the backend dependencies:

```bash
mkdir taleem-lms && cd taleem-lms
npm init -y
```

```bash
npm install express cors dotenv bcryptjs jsonwebtoken zod
npm install -D typescript tsx @types/express @types/cors @types/node @types/bcryptjs @types/jsonwebtoken esbuild
```

| Package        | Why                                                   |
| -------------- | ----------------------------------------------------- |
| `express`      | HTTP server & routing                                 |
| `cors`         | Cross-origin requests                                 |
| `bcryptjs`     | Password hashing / verification                       |
| `jsonwebtoken` | JWT access + refresh tokens                           |
| `zod`          | Request body validation                               |
| `tsx`          | Run TypeScript directly in dev                        |
| `esbuild`      | Bundle the server for production                      |

Add scripts to `package.json`:

```jsonc
{
  "scripts": {
    "dev": "tsx server.ts",
    "build": "esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs",
    "start": "node dist/server.cjs",
    "lint": "tsc --noEmit"
  }
}
```

---

## Step 2 — TypeScript Configuration

Create `tsconfig.json`:

```jsonc
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "resolveJsonModule": true,
    "noEmit": true
  },
  "include": ["src", "server.ts", "vite.config.ts"]
}
```

Create the entry file `server.ts`:

```ts
import './src/server/index';
```

---

## Step 3 — Backend Types (Domain Model)

Create `src/server/types/backend.ts` — it holds every entity the API works with. These mirror the database tables.

```ts
export type SystemRole =
  | 'super_admin' | 'principal' | 'administrator' | 'teacher'
  | 'student' | 'parent' | 'accountant' | 'staff';

export type Permission =
  | 'student.view' | 'student.create' | 'student.edit' | 'student.delete'
  | 'attendance.view' | 'attendance.create'
  | 'fees.view' | 'fees.collect'
  // …add every permission code you use in RBAC

export interface Institute {
  id: string;
  name: string;
  code: string;
  city: string;
  province: string;
  currency: string; // 'PKR'
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  institute_id: string;
  email: string;
  phone: string;
  password_hash: string;
  full_name: string;
  role: SystemRole;
  is_active: boolean;
  failed_login_attempts: number;
  lockout_until: string | null;
  last_login_at: string | null;
  created_at: string;
}

export interface AuthSession {
  user: {
    id: string;
    institute_id: string;
    email: string;
    full_name: string;
    role: SystemRole;
    permissions: Permission[];
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  pagination?: { page: number; limit: number; total: number };
}

// …continue for every table: StudentEntity, TeacherEntity, ParentEntity,
// ClassEntity, SectionEntity, SubjectEntity, CourseEntity, AttendanceRecord,
// AssignmentEntity, SubmissionEntity, ExamEntity, GradeRecordEntity,
// TimetableSlotEntity, FeeStructure, InvoiceEntity, PaymentRecord,
// AnnouncementEntity, MessageEntity, NotificationEntity, AuditLogEntity
```

**Tip:** the repo's full type file is `src/server/types/backend.ts` (~360 lines) — use it as the reference model.

---

## Step 4 — Config & Constants (RBAC + Security)

Create `src/server/config/constants.ts`:

```ts
import { SystemRole, Permission } from '../types/backend';

// 1. RBAC permission matrix: every role maps to permission codes
export const ROLE_PERMISSIONS: Record<SystemRole, Permission[]> = {
  super_admin: [
    'student.view', 'student.create', 'student.edit', 'student.delete',
    'attendance.view', 'attendance.create', 'fees.view', 'fees.collect',
    // …full list (see src/server/config/constants.ts)
  ],
  principal: [ /* subset of super_admin */ ],
  teacher:   [ /* view + create attendance, grade assignments */ ],
  student:   [ /* read-only + assignment.submit */ ],
  parent:    [ /* read-only for children */ ],
  // administrator, accountant, staff …
};

// 2. JWT config (load secrets from env with dev fallbacks)
export const JWT_CONFIG = {
  EXPIRES_IN: '24h',
  REFRESH_EXPIRES_IN: '7d',
  SECRET: process.env.JWT_SECRET || 'dev_secret',
  REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret'
};

// 3. Security thresholds
export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MINUTES: 15,
  MIN_PASSWORD_LENGTH: 8,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 200
};
```

---

## Step 5 — Utility Helpers

Create `src/server/utils/`:

### `password.ts` — hashing + strength checks

```ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function validatePasswordStrength(password: string) {
  if (password.length < 8) return { valid: false, reason: 'At least 8 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, reason: 'One uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, reason: 'One lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, reason: 'One digit' };
  return { valid: true };
}
```

### `jwt.ts` — token generation & verification

```ts
import jwt from 'jsonwebtoken';
import { JWT_CONFIG } from '../config/constants';
import { AuthSession } from '../types/backend';

export function generateTokens(payload: AuthSession['user']) {
  const token = jwt.sign(payload, JWT_CONFIG.SECRET, { expiresIn: JWT_CONFIG.EXPIRES_IN as any });
  const refreshToken = jwt.sign(
    { userId: payload.id, institute_id: payload.institute_id },
    JWT_CONFIG.REFRESH_SECRET,
    { expiresIn: JWT_CONFIG.REFRESH_EXPIRES_IN as any }
  );
  return { token, refreshToken };
}

export function verifyToken(token: string): AuthSession['user'] {
  return jwt.verify(token, JWT_CONFIG.SECRET) as AuthSession['user'];
}

export function verifyRefreshToken(token: string) {
  return jwt.verify(token, JWT_CONFIG.REFRESH_SECRET) as { userId: string; institute_id: string };
}
```

### `response.ts` — uniform API responses

```ts
import { Response } from 'express';
import { ApiResponse } from '../types/backend';

export function sendSuccess<T>(res: Response, data: T, message = 'OK', statusCode = 200) {
  const payload: ApiResponse<T> = { success: true, message, data };
  return res.status(statusCode).json(payload);
}

export function sendError(res: Response, message: string, statusCode = 400, code = 'BAD_REQUEST', details?: any) {
  const payload: ApiResponse = { success: false, error: { code, message, ...(details ? { details } : {}) } };
  return res.status(statusCode).json(payload);
}
```

### `logger.ts` — simple console logger

```ts
export const logger = {
  info: (msg: string, meta?: any) =>
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, meta ? JSON.stringify(meta) : ''),
  warn: (msg: string, meta?: any) => console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`),
  error: (msg: string, meta?: any) => console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, meta)
};
```

---

## Step 6 — The Database Layer

### 6a. Design the schema (`src/server/db/schema.sql`)

Write the production PostgreSQL schema — every table carries `institute_id` for **multi-tenancy**:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE institutes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  city VARCHAR(100) DEFAULT 'Islamabad',
  province VARCHAR(100) DEFAULT 'Federal',
  currency VARCHAR(10) DEFAULT 'PKR',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  institute_id UUID NOT NULL REFERENCES institutes(id) ON DELETE CASCADE,
  email VARCHAR(150) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role VARCHAR(30) NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  lockout_until TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  CONSTRAINT uq_users_institute_email UNIQUE (institute_id, email)
);
-- …attendance, assignments, exams, fee_structures, invoices, payments,
-- announcements, messages, notifications, audit_logs …(full file:
-- src/server/db/schema.sql)
```

### 6b. In-memory DB implementation (`src/server/db/database.ts`)

For the demo/dev server, implement the same tables as typed in-memory arrays plus tenant helpers:

```ts
import { User, StudentEntity, /* … */ } from '../types/backend';

class RelationalDatabase {
  public institutes: Institute[] = [];
  public users: User[] = [];
  public students: StudentEntity[] = [];
  // …one array per table

  findUserByEmail(email: string, instituteId?: string) {
    return this.users.find((u) =>
      !u.is_deleted &&
      u.email.toLowerCase() === email.toLowerCase() &&
      (!instituteId || u.institute_id === instituteId)
    );
  }

  getChildrenForParent(parentId: string): StudentEntity[] {
    const studentIds = this.parentStudentLinks
      .filter((l) => l.parent_id === parentId)
      .map((l) => l.student_id);
    return this.students.filter((s) => studentIds.includes(s.id) && !s.is_deleted);
  }

  logAudit(instituteId, userId, userName, userRole, action, targetResource, targetId?, ip?, metadata?) {
    this.auditLogs.unshift({ id: `audit-${Date.now()}`, /* …populate fields */ });
  }
}

export const db = new RelationalDatabase();
```

> **Switching to real PostgreSQL later:** replace the array operations with `pg`/`prisma` queries — the router code only touches `db.*`, so the swap is contained.

---

## Step 7 — Middleware

Create `src/server/middleware/`:

### `auth.middleware.ts` — JWT verification

```ts
import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendError } from '../utils/response';
import { db } from '../db/database';

export interface AuthenticatedRequest extends Request {
  user?: { id: string; institute_id: string; full_name: string; role: string; permissions: string[] };
  institute_id?: string;
}

export function authenticateJWT(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.split(' ')[1] : null;

  if (!token) return sendError(res, 'Authentication token required', 401, 'UNAUTHORIZED');

  try {
    const decoded = verifyToken(token);
    const user = db.findUserById(decoded.id);
    if (!user || !user.is_active) return sendError(res, 'User account deactivated', 401, 'UNAUTHORIZED');
    req.user = decoded;
    req.institute_id = decoded.institute_id;
    next();
  } catch {
    return sendError(res, 'Invalid or expired token', 401, 'TOKEN_EXPIRED');
  }
}
```

### `tenant.middleware.ts` — multi-tenant isolation

```ts
export function enforceTenantIsolation(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) return sendError(res, 'Authentication required', 401, 'UNAUTHORIZED');

  const requestedTenant = req.headers['x-institute-id'] as string;
  req.institute_id = req.user.role === 'super_admin' && requestedTenant
    ? requestedTenant
    : req.user.institute_id;

  if (!req.institute_id) return sendError(res, 'Tenant context missing', 400, 'MISSING_TENANT_CONTEXT');
  next();
}
```

### `rbac.middleware.ts` — permission & role guards

```ts
export function requirePermission(permission: Permission) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, 'Authentication required', 401);
    const perms = req.user.permissions || ROLE_PERMISSIONS[req.user.role] || [];
    if (!perms.includes(permission) && req.user.role !== 'super_admin') {
      return sendError(res, `Forbidden: requires '${permission}'`, 403, 'FORBIDDEN');
    }
    next();
  };
}

export function requireRole(...roles: SystemRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user.role) && req.user.role !== 'super_admin') {
      return sendError(res, `Forbidden: roles [${roles.join(', ')}]`, 403, 'FORBIDDEN');
    }
    next();
  };
}
```

### `rateLimiter.middleware.ts` — in-memory sliding window

```ts
const store = new Map<string, { count: number; resetTime: number }>();

export function createRateLimiter(windowMs = 15 * 60 * 1000, maxRequests = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.path}:${req.ip}`;
    const now = Date.now();
    const record = store.get(key);

    if (!record || now > record.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (record.count >= maxRequests) {
      res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
      return sendError(res, 'Too many requests', 429, 'RATE_LIMIT_EXCEEDED');
    }
    record.count++;
    next();
  };
}
```

### `audit.middleware.ts` — log successful mutations

```ts
export function auditAction(actionName: string, targetResource: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    res.on('finish', () => {
      if (res.statusCode >= 200 && res.statusCode < 300 && req.user) {
        db.logAudit(req.institute_id!, req.user.id, req.user.full_name, req.user.role,
          actionName, targetResource, (req.params.id || req.body.id), req.ip,
          { path: req.originalUrl, method: req.method });
      }
    });
    next();
  };
}
```

### `error.middleware.ts` — global error handler

```ts
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  logger.error('Unhandled error:', { message: err.message, path: req.path });
  if (err.name === 'ZodError') {
    return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.errors);
  }
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message;
  return sendError(res, message, statusCode, 'INTERNAL_SERVER_ERROR');
}
```

---

## Step 8 — Auth Module (Login, Refresh, Me)

Create `src/server/modules/auth/auth.routes.ts`:

```ts
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../../db/database';
import { comparePassword, validatePasswordStrength } from '../../utils/password';
import { generateTokens, verifyRefreshToken } from '../../utils/jwt';
import { sendSuccess, sendError } from '../../utils/response';
import { ROLE_PERMISSIONS, SECURITY_CONFIG } from '../../config/constants';
import { createRateLimiter } from '../../middleware/rateLimiter.middleware';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';

const router = Router();

const loginSchema = z.object({
  emailOrPhone: z.string().min(1),
  password: z.string().min(1),
  instituteCode: z.string().optional()
});

// POST /api/v1/auth/login  (rate limited: 10 tries / 15 min)
router.post('/login', createRateLimiter(15 * 60 * 1000, 10), async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);

    const user = db.users.find((u) =>
      !u.is_deleted && (u.email.toLowerCase() === body.emailOrPhone.toLowerCase() || u.phone === body.emailOrPhone));

    if (!user) return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');

    // lockout check
    if (user.lockout_until && new Date(user.lockout_until) > new Date()) {
      return sendError(res, 'Account locked', 423, 'ACCOUNT_LOCKED');
    }

    const match = await comparePassword(body.password, user.password_hash);
    if (!match) {
      user.failed_login_attempts = (user.failed_login_attempts || 0) + 1;
      if (user.failed_login_attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
        user.lockout_until = new Date(Date.now() + SECURITY_CONFIG.LOCKOUT_DURATION_MINUTES * 60_000).toISOString();
      }
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    user.failed_login_attempts = 0;
    user.lockout_until = null;
    user.last_login_at = new Date().toISOString();

    const institute = db.institutes.find((i) => i.id === user.institute_id);
    const userPayload = {
      id: user.id, institute_id: user.institute_id, email: user.email,
      phone: user.phone, full_name: user.full_name, role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || [], institute_name: institute?.name
    };
    const tokens = generateTokens(userPayload);

    db.logAudit(user.institute_id, user.id, user.full_name, user.role, 'LOGIN_SUCCESS', 'AUTH', user.id, req.ip);

    return sendSuccess(res, { user: userPayload, ...tokens }, 'Login successful');
  } catch (err: any) {
    if (err.name === 'ZodError') return sendError(res, 'Validation error', 400, 'VALIDATION_ERROR', err.errors);
    return sendError(res, err.message || 'Login failed', 500);
  }
});

// POST /api/v1/auth/refresh — exchange refresh token for a new pair
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  try {
    const decoded = verifyRefreshToken(refreshToken);
    const user = db.findUserById(decoded.userId);
    if (!user || !user.is_active) return sendError(res, 'User not active', 401);
    const tokens = generateTokens({
      id: user.id, institute_id: user.institute_id, email: user.email,
      full_name: user.full_name, role: user.role,
      permissions: ROLE_PERMISSIONS[user.role] || []
    });
    return sendSuccess(res, tokens, 'Token refreshed');
  } catch {
    return sendError(res, 'Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
  }
});

// GET /api/v1/auth/me — current profile (+ student/teacher/parent details)
router.get('/me', authenticateJWT, (req: AuthenticatedRequest, res) => {
  const user = db.findUserById(req.user!.id);
  if (!user) return sendError(res, 'User not found', 404);
  // …attach role-specific profile, return sendSuccess(res, { user, institute, profileDetails })
});

// POST /api/v1/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const val = validatePasswordStrength(newPassword);
  if (!val.valid) return sendError(res, val.reason!, 400, 'WEAK_PASSWORD');
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase() && !u.is_deleted);
  if (!user) return sendError(res, 'User not found', 404);
  user.password_hash = await hashPassword(newPassword);
  return sendSuccess(res, null, 'Password reset successfully');
});

// POST /api/v1/auth/logout — audit log only (JWT is stateless)
router.post('/logout', authenticateJWT, (req: AuthenticatedRequest, res) => {
  db.logAudit(req.user!.institute_id, req.user!.id, req.user!.full_name, req.user!.role, 'LOGOUT', 'AUTH');
  return sendSuccess(res, null, 'Logged out');
});

export default router;
```

---

## Step 9 — Feature Modules (The Router Pattern)

Every module follows the same pattern. Create `src/server/modules/<name>/<name>.routes.ts`:

### Template

```ts
import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { auditAction } from '../../middleware/audit.middleware';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);   // ALL routes: auth + tenant scope

// GET — list with query filters + role scoping
router.get('/', requirePermission('module.view'), (req: AuthenticatedRequest, res) => {
  let records = db.someTable.filter((r) => r.institute_id === req.institute_id);
  // …apply query filters and role scoping (e.g., students only see themselves)
  return sendSuccess(res, records);
});

// POST — create (Zod-validate body, audit on success)
router.post('/', requirePermission('module.create'), auditAction('RECORD_CREATED', 'MODULE'), (req, res) => {
  // validate with zod → push to db → sendSuccess(res, record, 'Created')
});

export default router;
```

### The 14 modules in this repo

| Module folder   | Router file                | Key endpoints                                                       |
| --------------- | -------------------------- | ------------------------------------------------------------------- |
| `auth`          | `auth.routes.ts`           | login, refresh, me, reset-password, logout                          |
| `institutes`    | `institutes.routes.ts`     | tenant CRUD                                                         |
| `academics`     | `academics.routes.ts`      | years, terms, classes, sections, subjects, courses                  |
| `students`      | `students.routes.ts`       | student registry CRUD                                               |
| `teachers`      | `teachers.routes.ts`       | teacher profiles                                                    |
| `parents`       | `parents.routes.ts`        | parents + parent–student links                                      |
| `attendance`    | `attendance.routes.ts`     | records, `/analytics` (threshold alerts), `/bulk` (mark 30–50 at once + auto parent notifications) |
| `lms`           | `lms.routes.ts`            | assignments, submissions                                            |
| `exams`         | `exams.routes.ts`          | exams, exam subjects, grade records                                 |
| `timetable`     | `timetable.routes.ts`      | weekly slots                                                        |
| `fees`          | `fees.routes.ts`           | fee structures, invoices, payments (PKR)                            |
| `communication` | `communication.routes.ts`  | announcements, messages, notifications                              |
| `reports`       | `reports.routes.ts`        | aggregated analytics                                                |
| `audit`         | `audit.routes.ts`          | audit log queries                                                   |

### Advanced example — bulk attendance (`attendance.routes.ts`)

```ts
router.post('/bulk', requirePermission('attendance.create'), (req: AuthenticatedRequest, res) => {
  const { class_id, section_id, date, records } = req.body;
  if (!class_id || !section_id || !date || !Array.isArray(records)) {
    return sendError(res, 'class_id, section_id, date, records required', 400);
  }

  let savedCount = 0;
  const absentStudentIds: string[] = [];

  records.forEach((item) => {
    // upsert record in db.attendance (unique on institute_id + student_id + date)
    if (item.status === 'ABSENT') absentStudentIds.push(item.student_id);
    savedCount++;
  });

  // Side effect: auto-notify parents of absent students
  absentStudentIds.forEach((stdId) => {
    const parentLink = db.parentStudentLinks.find((l) => l.student_id === stdId);
    if (parentLink) db.notifications.push({ /* Absence Alert notification */ });
  });

  // Audit trail
  db.logAudit(req.institute_id!, req.user!.id, req.user!.full_name, req.user!.role,
    'BULK_ATTENDANCE_MARKED', 'ATTENDANCE', `${class_id}:${section_id}`, req.ip,
    { date, totalMarked: savedCount, absentCount: absentStudentIds.length });

  return sendSuccess(res, { savedCount, date }, `Saved attendance for ${savedCount} students`);
});
```

---

## Step 10 — Server Bootstrap (`index.ts`)

Create `src/server/index.ts`:

```ts
import express from 'express';
import path from 'path';
import cors from 'cors';
import { seedDatabase } from './db/seed';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess } from './utils/response';

// import every module router…
import authRouter from './modules/auth/auth.routes';
import attendanceRouter from './modules/attendance/attendance.routes';
// …14 routers total

async function bootstrapServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true }));

  await seedDatabase();

  app.get('/api/v1/health', (_req, res) =>
    sendSuccess(res, { status: 'online', system: 'TaleemLMS Backend', version: '1.0.0' }, 'Backend operational'));

  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/attendance', attendanceRouter);
  // …mount all 14 routers under /api/v1/<module>

  // Dev: serve the Vite app from middleware; Production: serve dist/ statically
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(process.cwd(), 'dist')));
    app.get('*all', (_req, res) => res.sendFile(path.join(process.cwd(), 'dist/index.html')));
  }

  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => logger.info(`TaleemLMS running on http://0.0.0.0:${PORT}`));
}

bootstrapServer().catch((err) => logger.error('Bootstrap failed:', err));
```

---

## Step 11 — Seeding & Testing

### Seed (`src/server/db/seed.ts`)

Populate realistic data on startup — one institute + users for every role with a known password:

```ts
export async function seedDatabase() {
  if (db.institutes.length > 0) return; // already seeded

  const passwordHash = await hashPassword('Pass1234'); // demo password

  db.institutes.push({
    id: 'inst-imcg-001',
    name: 'Islamabad Model College',
    code: 'IMCG-001',
    city: 'Islamabad', province: 'Federal', currency: 'PKR',
    is_active: true, created_at: new Date().toISOString()
  });

  db.users.push(
    { id: 'usr-superadmin', institute_id: 'inst-imcg-001', email: 'admin@imcg.edu.pk', /* …role: 'super_admin', password_hash */ },
    { id: 'usr-principal',  institute_id: 'inst-imcg-001', email: 'principal@imcg.edu.pk', /* …role: 'principal' */ },
    // teachers, students, parents, accountant…
  );

  // students, classes, sections, attendance, invoices, announcements…
}
```

### Test suite (`src/server/tests/backend.test.ts`)

Write an integration test file that exercises the API through an in-memory server and returns results. Expose it over HTTP so it's runnable from the browser:

```ts
export async function runBackendTestSuite() {
  const results: { name: string; passed: boolean; details?: string }[] = [];
  // …start express app on an ephemeral port, run fetch() against /api/v1/*,
  // assert status codes & payloads, push results
  return { total: results.length, passed: results.filter((r) => r.passed).length, results };
}
```

Then register it in the bootstrap:

```ts
app.get('/api/v1/tests/run', async (_req, res) => {
  const results = await runBackendTestSuite();
  return sendSuccess(res, results, 'Backend test suite executed');
});
```

**Run the tests:** start the server, then open `http://localhost:3000/api/v1/tests/run`.

---

## Step 12 — Production Build & Deployment

```bash
# Type-check
npm run lint

# Build frontend (vite) + backend bundle (esbuild → dist/server.cjs)
npm run build

# Run production server (serves API + dist/ static files on port 3000)
npm start
```

Deployment checklist:

1. Set `NODE_ENV=production`.
2. Set strong `JWT_SECRET` and `JWT_REFRESH_SECRET`.
3. (Recommended) Swap the in-memory `db` for PostgreSQL and run `src/server/db/schema.sql`.
4. Put the server behind a reverse proxy (Nginx/Caddy) with HTTPS.
5. Scale out with a process manager (PM2) or containers (Docker).

---

## Step 13 — API Documentation (OpenAPI)

Keep an OpenAPI 3.0 spec at `src/server/docs/openapi.json` and serve it:

```ts
app.get('/api/v1/openapi.json', (_req, res) => {
  res.sendFile(path.join(process.cwd(), 'src/server/docs/openapi.json'));
});
```

Import it into Postman / Insomnia / Swagger UI for interactive docs.

---

## Final Checklist

- [ ] Express app bootstraps on port 3000 (`npm run dev`)
- [ ] `/api/v1/health` returns `{ success: true }`
- [ ] Seed data loads once (demo password `Pass1234`)
- [ ] Login → JWT issued; `/auth/me` works with `Authorization: Bearer <token>`
- [ ] Wrong password × 5 → account locked for 15 minutes
- [ ] Rate limiter returns 429 after N requests on login
- [ ] RBAC: student calling `POST /attendance/bulk` → 403
- [ ] Tenant isolation: users only see their own institute's rows
- [ ] Mutations create audit-log entries
- [ ] `/api/v1/tests/run` passes the whole suite
- [ ] `npm run lint` clean; `npm run build` produces `dist/server.cjs`; `npm start` serves app + API