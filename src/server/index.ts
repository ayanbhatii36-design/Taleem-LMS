import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';

import { seedDatabase } from './db/seed';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/error.middleware';
import { sendSuccess, sendError } from './utils/response';
import { runBackendTestSuite } from './tests/backend.test';

// Module Routes
import authRouter from './modules/auth/auth.routes';
import institutesRouter from './modules/institutes/institutes.routes';
import academicsRouter from './modules/academics/academics.routes';
import studentsRouter from './modules/students/students.routes';
import teachersRouter from './modules/teachers/teachers.routes';
import parentsRouter from './modules/parents/parents.routes';
import attendanceRouter from './modules/attendance/attendance.routes';
import lmsRouter from './modules/lms/lms.routes';
import examsRouter from './modules/exams/exams.routes';
import timetableRouter from './modules/timetable/timetable.routes';
import feesRouter from './modules/fees/fees.routes';
import communicationRouter from './modules/communication/communication.routes';
import reportsRouter from './modules/reports/reports.routes';
import auditRouter from './modules/audit/audit.routes';

async function bootstrapServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors({ origin: '*', credentials: true }));
  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Initialize DB with seed data
  await seedDatabase();

  // Health Check Endpoint
  app.get('/api/v1/health', (req, res) => {
    return sendSuccess(
      res,
      {
        status: 'online',
        system: 'TaleemLMS Backend SaaS Platform',
        version: '1.0.0',
        uptimeSeconds: Math.floor(process.uptime()),
        timestamp: new Date().toISOString()
      },
      'Backend operational'
    );
  });

  // Run Test Suite Endpoint
  app.get('/api/v1/tests/run', async (req, res) => {
    const results = await runBackendTestSuite();
    return sendSuccess(res, results, 'Backend test suite executed');
  });

  // Serve OpenAPI Spec
  app.get('/api/v1/openapi.json', (req, res) => {
    res.sendFile(path.join(process.cwd(), 'src/server/docs/openapi.json'));
  });

  // Mount API v1 Routers
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/institutes', institutesRouter);
  app.use('/api/v1/academics', academicsRouter);
  app.use('/api/v1/students', studentsRouter);
  app.use('/api/v1/teachers', teachersRouter);
  app.use('/api/v1/parents', parentsRouter);
  app.use('/api/v1/attendance', attendanceRouter);
  app.use('/api/v1/lms', lmsRouter);
  app.use('/api/v1/exams', examsRouter);
  app.use('/api/v1/timetable', timetableRouter);
  app.use('/api/v1/fees', feesRouter);
  app.use('/api/v1/communication', communicationRouter);
  app.use('/api/v1/reports', reportsRouter);
  app.use('/api/v1/audit', auditRouter);

  // Vite Development / Production Middleware setup
  if (process.env.NODE_ENV !== 'production') {
    logger.info('Connecting Vite Dev Server Middleware...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    logger.info('Serving Production Built Static Assets from /dist...');
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler
  app.use(errorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 TaleemLMS Backend Server running on http://0.0.0.0:${PORT}`);
  });
}

bootstrapServer().catch((err) => {
  logger.error('Failed to bootstrap server:', err);
});
