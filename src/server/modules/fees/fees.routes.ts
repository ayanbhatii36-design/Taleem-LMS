import { Router } from 'express';
import { repo } from '../../db/repository';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { InvoiceEntity } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Fee Structures
router.get('/structures', requirePermission('fees.view'), async (req: AuthenticatedRequest, res) => {
  const structures = await repo.feeStructures.find({ institute_id: req.institute_id });
  return sendSuccess(res, structures);
});

// Payments ledger — super admin sees all tenants, others only their own
router.get('/payments', async (req: AuthenticatedRequest, res) => {
  try {
    const filter: any = {};
    if (req.user?.role !== 'super_admin') {
      filter.institute_id = req.institute_id;
    }

    const payments = await repo.payments.find(filter, {
      sort: { field: 'paid_date', direction: -1 }
    });

    const [invoices, students, institutes] = await Promise.all([
      repo.invoices.find({}),
      repo.students.find({}),
      repo.institutes.find({})
    ]);
    const invoiceMap = new Map(invoices.map((i) => [i.id, i]));
    const studentMap = new Map(students.map((s) => [s.id, s]));
    const instituteMap = new Map(institutes.map((i) => [i.id, i]));

    const populated = payments.map((pay) => {
      const invoice = invoiceMap.get(pay.invoice_id);
      const student = invoice ? studentMap.get(invoice.student_id) : undefined;
      const institute = instituteMap.get(pay.institute_id);
      return {
        ...pay,
        invoice_no: invoice?.invoice_no || null,
        student_name: student?.full_name || null,
        institute_name: institute?.name || null,
        institute_code: institute?.code || null
      };
    });

    return sendSuccess(res, populated);
  } catch (err: any) {
    return sendError(res, err.message || 'Failed to retrieve payments', 500);
  }
});

router.post('/structures', requirePermission('fees.create'), async (req: AuthenticatedRequest, res) => {
  const { class_id, title, amount_pkr, frequency, due_day_of_month, late_fee_fine_pkr } = req.body;
  if (!class_id || !title || !amount_pkr) {
    return sendError(res, 'class_id, title, and amount_pkr required', 400);
  }

  const newFs = await repo.feeStructures.insertOne({
    institute_id: req.institute_id!,
    class_id,
    title,
    amount_pkr: parseFloat(amount_pkr),
    frequency: frequency || 'MONTHLY',
    due_day_of_month: due_day_of_month || 10,
    late_fee_fine_pkr: late_fee_fine_pkr || 500
  });

  return sendSuccess(res, newFs, 'Fee structure created', 201);
});

// Invoices
router.get('/invoices', requirePermission('fees.view'), async (req: AuthenticatedRequest, res) => {
  const { student_id, status, class_id } = req.query;

  const filter: any = { institute_id: req.institute_id };

  if (req.user?.role === 'student') {
    const student = await repo.students.findOne({ user_id: req.user.id });
    if (student) filter.student_id = student.id;
  } else if (req.user?.role === 'parent') {
    const parent = await repo.parents.findOne({ user_id: req.user.id });
    const links = parent ? await repo.parentStudentLinks.find({ parent_id: parent.id }) : [];
    const childIds = links.map((l) => l.student_id);
    filter.student_id = { $in: childIds };
  } else {
    if (student_id) filter.student_id = student_id as string;
    if (status) filter.status = status as string;
    if (class_id) filter.class_id = class_id as string;
  }

  const invoices = await repo.invoices.find(filter);

  const populated = await Promise.all(
    invoices.map(async (inv) => {
      const student = await repo.students.findOne({ id: inv.student_id });
      const payments = await repo.payments.find({ invoice_id: inv.id });
      return {
        ...inv,
        studentName: student?.full_name,
        rollNo: student?.roll_no,
        registrationNo: student?.registration_no,
        payments
      };
    })
  );

  return sendSuccess(res, populated);
});

// Generate Invoice
router.post('/invoices/generate', requirePermission('fees.create'), async (req: AuthenticatedRequest, res) => {
  const { student_id, title, amount_pkr, discount_pkr = 0, due_date, fee_structure_id } = req.body;

  const student = await repo.students.findOne({ id: student_id, institute_id: req.institute_id });
  if (!student) return sendError(res, 'Student not found', 404);

  const amount = parseFloat(amount_pkr);
  const discount = parseFloat(discount_pkr);
  const netAmount = amount - discount;

  const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`;

  const newInvoice = await repo.invoices.insertOne({
    institute_id: req.institute_id!,
    invoice_no: invoiceNo,
    student_id: student.id,
    class_id: student.class_id,
    fee_structure_id: fee_structure_id || null,
    title: title || 'Monthly Fee Invoice',
    amount_pkr: amount,
    discount_pkr: discount,
    net_amount_pkr: netAmount,
    paid_amount_pkr: 0,
    issue_date: new Date().toISOString().slice(0, 10),
    due_date: due_date || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    status: 'UNPAID'
  });

  return sendSuccess(res, newInvoice, 'Fee invoice generated successfully', 201);
});

// Collect Payment (Supports Cash, Bank Transfer, JazzCash, EasyPaisa)
router.post('/invoices/:id/collect-payment', requirePermission('fees.collect'), async (req: AuthenticatedRequest, res) => {
  const invoice = await repo.invoices.findOne({ id: req.params.id, institute_id: req.institute_id });
  if (!invoice) return sendError(res, 'Invoice not found', 404);

  const { amount_pkr, payment_method, transaction_ref, notes } = req.body;
  if (!amount_pkr || !payment_method) {
    return sendError(res, 'amount_pkr and payment_method are required', 400);
  }

  const payAmt = parseFloat(amount_pkr);
  const newPaidAmount = invoice.paid_amount_pkr + payAmt;

  let status: InvoiceEntity['status'] = invoice.status;
  if (newPaidAmount >= invoice.net_amount_pkr) {
    status = 'PAID';
  } else if (newPaidAmount > 0) {
    status = 'PARTIALLY_PAID';
  }

  const updatedInvoice = await repo.invoices.updateOne(
    { id: invoice.id },
    { status, paid_amount_pkr: newPaidAmount }
  );

  const payment = await repo.payments.insertOne({
    institute_id: req.institute_id!,
    invoice_id: invoice.id,
    receipt_no: `RCT-${Date.now()}`,
    amount_pkr: payAmt,
    payment_method,
    transaction_ref: transaction_ref || '',
    paid_date: new Date().toISOString(),
    recorded_by_user_id: req.user!.id,
    notes: notes || ''
  });

  await repo.auditLogs.insertOne({
    institute_id: req.institute_id!,
    user_id: req.user!.id,
    user_name: req.user!.full_name,
    user_role: req.user!.role,
    action: 'COLLECT_FEE_PAYMENT',
    target_resource: 'FEE_INVOICE',
    target_id: invoice.id,
    ip_address: req.ip,
    metadata_json: JSON.stringify({ paidAmount: payAmt, paymentMethod: payment_method, receiptNo: payment.receipt_no })
  });

  return sendSuccess(res, { invoice: updatedInvoice || invoice, payment }, 'Payment recorded successfully');
});

export default router;