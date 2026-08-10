import { Router } from 'express';
import { db } from '../../db/database';
import { sendSuccess, sendError } from '../../utils/response';
import { authenticateJWT, AuthenticatedRequest } from '../../middleware/auth.middleware';
import { enforceTenantIsolation } from '../../middleware/tenant.middleware';
import { requirePermission } from '../../middleware/rbac.middleware';
import { FeeStructure, InvoiceEntity, PaymentRecord } from '../../types/backend';

const router = Router();
router.use(authenticateJWT, enforceTenantIsolation);

// Fee Structures
router.get('/structures', requirePermission('fees.view'), (req: AuthenticatedRequest, res) => {
  const structures = db.feeStructures.filter((fs) => fs.institute_id === req.institute_id);
  return sendSuccess(res, structures);
});

router.post('/structures', requirePermission('fees.create'), (req: AuthenticatedRequest, res) => {
  const { class_id, title, amount_pkr, frequency, due_day_of_month, late_fee_fine_pkr } = req.body;
  if (!class_id || !title || !amount_pkr) {
    return sendError(res, 'class_id, title, and amount_pkr required', 400);
  }

  const newFs: FeeStructure = {
    id: `fs-${Date.now()}`,
    institute_id: req.institute_id!,
    class_id,
    title,
    amount_pkr: parseFloat(amount_pkr),
    frequency: frequency || 'MONTHLY',
    due_day_of_month: due_day_of_month || 10,
    late_fee_fine_pkr: late_fee_fine_pkr || 500,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.feeStructures.push(newFs);
  return sendSuccess(res, newFs, 'Fee structure created', 201);
});

// Invoices
router.get('/invoices', requirePermission('fees.view'), (req: AuthenticatedRequest, res) => {
  const { student_id, status, class_id } = req.query;

  let invoices = db.invoices.filter((inv) => inv.institute_id === req.institute_id);

  if (req.user?.role === 'student') {
    const student = db.findStudentByUserId(req.user.id);
    if (student) invoices = invoices.filter((i) => i.student_id === student.id);
  } else if (req.user?.role === 'parent') {
    const parent = db.findParentByUserId(req.user.id);
    const children = parent ? db.getChildrenForParent(parent.id) : [];
    const childIds = children.map((c) => c.id);
    invoices = invoices.filter((i) => childIds.includes(i.student_id));
  } else {
    if (student_id) invoices = invoices.filter((i) => i.student_id === student_id);
    if (status) invoices = invoices.filter((i) => i.status === status);
    if (class_id) invoices = invoices.filter((i) => i.class_id === class_id);
  }

  const populated = invoices.map((inv) => {
    const student = db.students.find((s) => s.id === inv.student_id);
    const payments = db.payments.filter((p) => p.invoice_id === inv.id);
    return {
      ...inv,
      studentName: student?.full_name,
      rollNo: student?.roll_no,
      registrationNo: student?.registration_no,
      payments
    };
  });

  return sendSuccess(res, populated);
});

// Generate Invoice
router.post('/invoices/generate', requirePermission('fees.create'), (req: AuthenticatedRequest, res) => {
  const { student_id, title, amount_pkr, discount_pkr = 0, due_date, fee_structure_id } = req.body;

  const student = db.students.find((s) => s.id === student_id && s.institute_id === req.institute_id);
  if (!student) return sendError(res, 'Student not found', 404);

  const amount = parseFloat(amount_pkr);
  const discount = parseFloat(discount_pkr);
  const netAmount = amount - discount;

  const invoiceNo = `INV-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.floor(10 + Math.random() * 90)}`;

  const newInvoice: InvoiceEntity = {
    id: `inv-${Date.now()}`,
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
    status: 'UNPAID',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.invoices.push(newInvoice);
  return sendSuccess(res, newInvoice, 'Fee invoice generated successfully', 201);
});

// Collect Payment (Supports Cash, Bank Transfer, JazzCash, EasyPaisa)
router.post('/invoices/:id/collect-payment', requirePermission('fees.collect'), (req: AuthenticatedRequest, res) => {
  const invoice = db.invoices.find((inv) => inv.id === req.params.id && inv.institute_id === req.institute_id);
  if (!invoice) return sendError(res, 'Invoice not found', 404);

  const { amount_pkr, payment_method, transaction_ref, notes } = req.body;
  if (!amount_pkr || !payment_method) {
    return sendError(res, 'amount_pkr and payment_method are required', 400);
  }

  const payAmt = parseFloat(amount_pkr);
  const newPaidAmount = invoice.paid_amount_pkr + payAmt;

  if (newPaidAmount >= invoice.net_amount_pkr) {
    invoice.status = 'PAID';
  } else if (newPaidAmount > 0) {
    invoice.status = 'PARTIALLY_PAID';
  }
  invoice.paid_amount_pkr = newPaidAmount;
  invoice.updated_at = new Date().toISOString();

  const payment: PaymentRecord = {
    id: `pay-${Date.now()}`,
    institute_id: req.institute_id!,
    invoice_id: invoice.id,
    receipt_no: `RCT-${Date.now()}`,
    amount_pkr: payAmt,
    payment_method,
    transaction_ref: transaction_ref || '',
    paid_date: new Date().toISOString(),
    recorded_by_user_id: req.user!.id,
    notes: notes || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  db.payments.push(payment);

  db.logAudit(
    req.institute_id!,
    req.user!.id,
    req.user!.full_name,
    req.user!.role,
    'COLLECT_FEE_PAYMENT',
    'FEE_INVOICE',
    invoice.id,
    req.ip,
    { paidAmount: payAmt, paymentMethod: payment_method, receiptNo: payment.receipt_no }
  );

  return sendSuccess(res, { invoice, payment }, 'Payment recorded successfully');
});

export default router;
