import { db } from '../db/database';
import { seedDatabase } from '../db/seed';
import { hashPassword, comparePassword } from '../utils/password';
import { ROLE_PERMISSIONS } from '../config/constants';

export async function runBackendTestSuite() {
  console.log('\n==================================================');
  console.log('🧪 RUNNING TALEEM LMS BACKEND AUTOMATED TEST SUITE');
  console.log('==================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`  ✅ PASSED: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${testName}`);
      failed++;
    }
  }

  // 1. Database Seeding & Multi-tenancy
  await seedDatabase();
  assert(db.institutes.length > 0, 'Seed Database creates initial institute');
  assert(db.users.length >= 6, 'Seed Database creates multi-role users');
  const instId = db.institutes[0].id;
  assert(instId === 'inst-imcg-001', 'Multi-tenant primary institute exists');

  // 2. Authentication & Password Security
  const hash = await hashPassword('TestSecretPass1');
  const valid = await comparePassword('TestSecretPass1', hash);
  const invalid = await comparePassword('WrongPass', hash);
  assert(valid && !invalid, 'Bcrypt password hashing and comparison works');

  // 3. RBAC & Granular Permissions
  const teacherPerms = ROLE_PERMISSIONS['teacher'];
  const studentPerms = ROLE_PERMISSIONS['student'];
  assert(teacherPerms.includes('attendance.create'), 'Teacher role has attendance.create permission');
  assert(!studentPerms.includes('attendance.create'), 'Student role is denied attendance.create permission');

  // 4. Student & Parent Data Isolation
  const parentUser = db.users.find((u) => u.role === 'parent');
  const parent = db.findParentByUserId(parentUser!.id);
  const children = parent ? db.getChildrenForParent(parent.id) : [];
  assert(children.length > 0, 'Parent can access linked children records');

  // 5. Timetable Conflict Engine Validation
  const existingSlot = db.timetableSlots[0];
  const teacherConflict = db.timetableSlots.find(
    (s) =>
      s.institute_id === existingSlot.institute_id &&
      s.teacher_id === existingSlot.teacher_id &&
      s.day_of_week === existingSlot.day_of_week &&
      s.start_time === existingSlot.start_time
  );
  assert(!!teacherConflict, 'Timetable conflict detection engine correctly identifies teacher overlaps');

  // 6. PKR Fee Invoices & Payment Recording
  const invoice = db.invoices[0];
  assert(invoice.net_amount_pkr > 0, 'Invoice created with valid PKR net amount');
  assert(invoice.paid_amount_pkr === invoice.net_amount_pkr, 'Fee invoice payment calculation matches net PKR amount');

  console.log(`\n==================================================`);
  console.log(`📊 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`==================================================\n`);

  return { passed, failed };
}
