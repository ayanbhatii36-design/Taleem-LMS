# TaleemLMS — Project Documentation

> **TaleemLMS** is a full-stack Learning Management System (LMS) and institute-management platform built for Pakistani schools, colleges & academies. It combines a **React + TypeScript + Tailwind CSS** frontend, an **Express + TypeScript** backend API, and a **multi-tenant SaaS Super-Admin** control center.

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Frontend (School Portal)](#frontend-school-portal)
4. [Super Admin (SaaS Platform)](#super-admin-saas-platform)
5. [Backend API](#backend-api)
6. [Database Schema](#database-schema)
7. [Authentication & Security](#authentication--security)
8. [Responsive Design](#responsive-design)
9. [Scripts](#scripts)
10. [Environment Variables](#environment-variables)

---

## Tech Stack

| Layer       | Technology                                                            |
| ----------- | --------------------------------------------------------------------- |
| UI          | React 19, TypeScript, Tailwind CSS v4, Lucide icons                   |
| Charts      | Recharts                                                              |
| Animations  | Motion (Framer Motion successor)                                      |
| Build       | Vite 6 + esbuild                                                      |
| Backend     | Express 4, TypeScript (tsx runtime)                                   |
| Validation  | Zod                                                                   |
| Auth        | JWT (jsonwebtoken), bcryptjs password hashing, 2FA flow (demo)        |
| Data layer  | In-memory relational database (`src/server/db`) + PostgreSQL schema   |
| AI          | `@google/genai` (Gemini) dependency (optional)                        |

---

## Project Structure

```
TALEEM LMS/
├── index.html                  # Vite entry (fonts, root div, theme classes)
├── server.ts                   # Backend bootstrap entry (imports src/server/index)
├── vite.config.ts              # Vite + Tailwind v4 plugin + @ alias
├── package.json                # Scripts & dependencies
├── tsconfig.json
├── .env.example                # GEMINI_API_KEY, APP_URL
├── dist/                       # Production build output
├── assets/                     # Static assets (AI Studio config)
└── src/
    ├── main.tsx                # React root render
    ├── index.css               # Tailwind import + dark variant
    ├── App.tsx                 # Root app shell: routing, state, role switching
    ├── types.ts                # Frontend domain types (Student, Teacher, ...)
    ├── data/
    │   └── mockData.ts         # Frontend demo/mock data
    ├── components/
    │   ├── auth/               # LandingPage, LoginModal, OnboardingModal
    │   ├── common/             # Header, Sidebar, SearchModal, NotificationDrawer, ConfirmDialog
    │   ├── dashboards/         # Student, Teacher, Principal, Parent dashboards
    │   └── modules/            # 10 feature modules (see below)
    ├── superadmin/             # SaaS multi-tenant control center
    │   ├── types.ts            # SuperAdmin domain types
    │   ├── data.ts             # SuperAdmin mock data
    │   └── components/         # 16 SuperAdmin views & modals
    └── server/                 # Express backend
        ├── index.ts            # Server bootstrap + route mounting
        ├── config/constants.ts # RBAC permission matrix, JWT & security config
        ├── db/                 # database.ts (in-memory DB), schema.sql, seed.ts
        ├── middleware/         # auth, rbac, tenant, rateLimiter, audit, error
        ├── modules/            # 14 feature routers (auth → audit)
        ├── types/backend.ts    # Backend domain types
        ├── utils/              # jwt, password, response, logger
        ├── tests/backend.test.ts  # Self-running API test suite
        └── docs/openapi.json   # OpenAPI 3.0 specification
```

---

## Frontend (School Portal)

### App Shell (`src/App.tsx`)

- Holds global state: `currentRole`, `activeTab`, dark mode, modals, and all mock entity arrays.
- Two top-level view modes: **Super Admin** (`SuperAdminDashboard`) and **School** portal.
- Role switcher (Principal / Teacher / Student / Parent) changes the sidebar + dashboard.
- Contains the responsive layout:

```
<Header /> (sticky top bar: brand, search, role switcher, theme, notifications, profile)
<Sidebar /> (desktop persistent / mobile drawer overlay)
<main />    (scrollable content area, max-w-7xl)
```

### Common Components

| Component            | Purpose                                              |
| -------------------- | ---------------------------------------------------- |
| `Header`             | Sticky top bar with role switcher, Ctrl+K search trigger, theme toggle, notification bell, profile menu |
| `Sidebar`            | Role-based navigation; hidden on mobile, opens as a drawer with backdrop |
| `SearchModal`        | Ctrl+K global search across students, teachers, invoices, classes |
| `NotificationDrawer` | Right-side drawer listing announcements w/ filters   |
| `ConfirmDialog`      | Reusable confirm modal                               |

### Dashboards (per role)

| Role       | File                        | Highlights                                                        |
| ---------- | --------------------------- | ----------------------------------------------------------------- |
| Principal  | `PrincipalDashboard.tsx`    | Command-center banner, 4 KPIs, attendance & fee charts (Recharts), at-risk students, notices |
| Teacher    | `TeacherDashboard.tsx`      | Class cards, today's timetable, assignments, quick actions        |
| Student    | `StudentDashboard.tsx`      | GPA/attendance stats, enrolled courses, upcoming exams, timetable |
| Parent     | `ParentDashboard.tsx`       | Child switcher, children KPIs, attendance summary, message teacher |

### Feature Modules (`src/components/modules/`)

| Module                   | File                    | Description                                              |
| ------------------------ | ----------------------- | -------------------------------------------------------- |
| Student Management       | `StudentManagement.tsx` | Registry, search/filters, CSV export, bulk actions, add/view modal |
| Teacher Management       | `TeacherManagement.tsx` | Faculty cards, add/delete, profile modal                 |
| Academic Structure       | `AcademicStructure.tsx` | Classes & sections, course curriculum manager            |
| Attendance               | `AttendanceModule.tsx`  | Mark-all-present, per-student status toggles, table      |
| Assessment               | `AssessmentModule.tsx`  | Assignments & exams tabs, create modals, grading         |
| Timetable                | `TimetableModule.tsx`   | Weekly timetable grid (horizontal scroll on mobile)      |
| Fee Management (PKR)     | `FeeManagement.tsx`     | Invoices, PKR amounts, pay/print flows                   |
| Communication            | `CommunicationModule.tsx`| Announcements + messages, chat-style layout             |
| Analytics & Reports      | `AnalyticsReports.tsx`  | Charts: attendance trends, fee collection, subject perf  |
| Institute Settings       | `InstituteSettings.tsx` | Institute profile, contact & branding settings           |

---

## Super Admin (SaaS Platform)

Located in `src/superadmin/`. A multi-tenant SaaS control center.

### Shell

- `SuperAdminDashboard.tsx` — master state (schools, plans, transactions, users, tickets, audit logs), section router, impersonation, modals.
- `SuperAdminSidebar.tsx` — collapsible (desktop) / slide-in drawer (mobile) navigation with live badges (pending schools, open tickets, MRR).
- `SuperAdminTopNav.tsx` — sticky header: command palette (Ctrl+K), system-health popover, notifications, profile menu, mobile menu button.

### Views

| View                    | File                          | Purpose                                        |
| ----------------------- | ----------------------------- | ---------------------------------------------- |
| Dashboard Overview      | `DashboardOverview.tsx`       | KPIs (MRR, schools, tickets, uptime), charts   |
| Schools Management      | `SchoolsManagementView.tsx`   | Tenant list, status badges, suspend/impersonate/delete |
| School Details          | `SchoolDetailsView.tsx`       | Per-tenant tabs: overview, billing, users, audit |
| Subscription Plans      | `SubscriptionPlansView.tsx`   | Plan tiers CRUD (PKR)                          |
| Billing & Payments      | `BillingPaymentsView.tsx`     | Transactions, refund/retry, invoices          |
| User Management         | `UserManagementView.tsx`      | Global users, impersonate, suspend, reset pwd  |
| Support Tickets         | `SupportTicketsView.tsx`      | Ticket thread replies, status updates          |
| Platform Analytics      | `PlatformAnalyticsView.tsx`   | Growth/MRR charts                             |
| Audit Logs              | `AuditLogsView.tsx`           | Security trail                                |
| System Status           | `SystemStatusView.tsx`        | Services health, backup/cache actions          |
| Global Settings         | `GlobalSettingsView.tsx`      | Payment gateway, SMS masks, maintenance mode   |

### Modals

`AddSchoolWizardModal` (5-step onboarding wizard), `SubscriptionDetailsModal`, `ConfirmDangerModal` (type-to-confirm DELETE), `CommandPalette` (Ctrl+K), `ImpersonationBanner`.

---

## Backend API

Bootstrap: `server.ts` → `src/server/index.ts`. Express app on port **3000**, serves the API and (in production) the built frontend from `dist/`.

### Endpoint Prefixes

| Prefix                 | Module                            |
| ---------------------- | --------------------------------- |
| `/api/v1/health`       | Health check                      |
| `/api/v1/tests/run`    | Run in-memory API test suite      |
| `/api/v1/openapi.json` | OpenAPI 3.0 spec                  |
| `/api/v1/auth`         | Login, refresh, me, reset-password, logout |
| `/api/v1/institutes`   | Institute (tenant) CRUD           |
| `/api/v1/academics`    | Years, terms, classes, sections, subjects, courses |
| `/api/v1/students`     | Student registry                  |
| `/api/v1/teachers`     | Teacher profiles                  |
| `/api/v1/parents`      | Parents + child links             |
| `/api/v1/attendance`   | Records, analytics, bulk marking  |
| `/api/v1/lms`          | Assignments, submissions          |
| `/api/v1/exams`        | Exams, exam subjects, grades      |
| `/api/v1/timetable`    | Weekly slots                      |
| `/api/v1/fees`         | Fee structures, invoices, payments (PKR) |
| `/api/v1/communication`| Announcements, messages, notifications |
| `/api/v1/reports`      | Aggregated reports                |
| `/api/v1/audit`        | Audit log queries                 |

### Middleware Pipeline

1. **`authenticateJWT`** — verifies `Bearer` token, loads user, attaches `req.user`.
2. **`enforceTenantIsolation`** — scopes every query to `req.institute_id` (super admin can override with `X-Institute-Id` header).
3. **`requirePermission('xxx.yyy')`** / **`requireRole(...)`** — RBAC check against `ROLE_PERMISSIONS` matrix.
4. **`createRateLimiter(windowMs, max)`** — per-path/IP sliding-window limiter (login: 10 / 15 min).
5. **`auditAction(action, resource)`** — logs successful requests to the audit trail on response finish.
6. **`errorHandler`** — central Zod + generic error handler.

### Standard Response Shape

```jsonc
// Success
{ "success": true, "message": "…", "data": { … } }

// Error
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": […] } }
```

### Data Layer

- `src/server/db/database.ts` — in-memory relational store (`db`) implementing the `schema.sql` tables as typed arrays, with tenant-scoped helpers and `logAudit()`.
- `src/server/db/schema.sql` — full PostgreSQL 14+ schema (20+ tables, indexes, constraints) for production.
- `src/server/db/seed.ts` — seeds a realistic Pakistani institute (users for every role, password `Pass1234`).

### Example Module Pattern (`attendance.routes.ts`)

```ts
const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

router.get('/', requirePermission('attendance.view'), (req, res) => {
  // filter db.attendance by req.institute_id + role scoping
  return sendSuccess(res, records);
});

router.post('/bulk', requirePermission('attendance.create'), (req, res) => {
  // bulk upsert + auto parent notifications + audit log
  return sendSuccess(res, { savedCount });
});
```

---

## Database Schema

20+ tables in `src/server/db/schema.sql`, all tenant-scoped via `institute_id`:

- **Tenants**: `institutes`
- **Identity**: `users`, `permissions`, `role_permissions`
- **Academics**: `academic_years`, `terms`, `classes`, `sections`, `rooms`
- **Curriculum**: `subjects`, `courses`
- **People**: `teachers`, `students`, `parents`, `parent_student_links`
- **Operations**: `attendance`, `assignments`, `submissions`, `exams`, `exam_subjects`, `grade_records`, `timetable_slots`
- **Finance (PKR)**: `fee_structures`, `invoices`, `payments`
- **Communication**: `announcements`, `messages`, `notifications`
- **Governance**: `audit_logs`, `file_metadata`

---

## Authentication & Security

| Feature                        | Implementation                                              |
| ------------------------------ | ----------------------------------------------------------- |
| Password hashing               | bcryptjs (10 salt rounds)                                   |
| JWT access token               | 24h expiry, `JWT_SECRET`                                    |
| JWT refresh token              | 7d expiry, `JWT_REFRESH_SECRET`, `/auth/refresh` endpoint   |
| Account lockout                | 5 failed attempts → 15-min lock (`SECURITY_CONFIG`)         |
| Password strength validation   | ≥8 chars, upper, lower, digit                               |
| 2FA                            | Demo 6-digit SMS code flow in the login modal               |
| Rate limiting                  | In-memory limiter on sensitive routes                       |
| RBAC                           | 8 roles × 40+ permission codes in `ROLE_PERMISSIONS`        |
| Tenant isolation               | All routes filtered by `institute_id`                       |
| Audit trail                    | `db.logAudit()` on login, bulk ops, password resets, etc.   |

---

## Responsive Design

The entire app is **mobile-first responsive** (breakpoints: `sm` 640, `md` 768, `lg` 1024, `xl` 1280):

| Area                     | Approach                                                                  |
| ------------------------ | ------------------------------------------------------------------------- |
| App shell                | Header hides brand text on phones; sidebar becomes a slide-in drawer with backdrop; content uses `p-4 md:p-6 lg:p-8` |
| Grids                    | Every grid uses a `grid-cols-1` base + responsive steps (`sm:`/`md:`/`lg:`) |
| Tables                   | Wrapped in `overflow-x-auto`; wide tables get `min-w-[700px]` + horizontal scroll |
| Modals & drawers         | `w-full max-w-*` + `max-h-[90vh] overflow-y-auto` so they fit phone viewports |
| Charts                   | Recharts `ResponsiveContainer` with fixed-height wrappers (`h-56`/`h-60`)  |
| Super Admin              | Sidebar `fixed … -translate-x-full lg:translate-x-0`, top-nav hamburger on mobile, popovers capped with `max-w-[calc(100vw-2rem)]` |
| Dashboards / Modules     | Stat cards `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`; action rows use `flex-wrap` / `flex-col sm:flex-row` |

---

## Scripts

```bash
npm run dev        # Run the Express + Vite dev server (tsx server.ts)
npm run build      # vite build + esbuild bundle server → dist/server.cjs
npm start          # node dist/server.cjs (production)
npm run preview    # vite preview
npm run lint       # tsc --noEmit (type check)
npm run clean      # remove dist & server.js
```

---

## Environment Variables

| Variable              | Purpose                          |
| --------------------- | -------------------------------- |
| `GEMINI_API_KEY`      | Optional Gemini AI API key       |
| `APP_URL`             | Hosted app URL (self-referencing)|
| `JWT_SECRET`          | Access-token signing secret (falls back to a dev default) |
| `JWT_REFRESH_SECRET`  | Refresh-token signing secret     |
| `NODE_ENV`            | `production` serves `dist/` static assets |