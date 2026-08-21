import React, { useState } from 'react';
import {
  CreditCard,
  DollarSign,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Sparkles,
  Building2,
  FileText
} from 'lucide-react';
import { UserRole, FeeInvoice } from '../../types';

interface FeeManagementProps {
  currentRole: UserRole;
  feeInvoices: FeeInvoice[];
  onPayInvoice: (id: string, method: string) => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({
  currentRole,
  feeInvoices,
  onPayInvoice
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedInvoice, setSelectedInvoice] = useState<FeeInvoice | null>(null);
  const [paymentGatewayModal, setPaymentGatewayModal] = useState<FeeInvoice | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'EasyPaisa' | 'JazzCash' | 'Bank Transfer'>('EasyPaisa');

  const filteredInvoices = feeInvoices.filter((inv) => {
    const matchesSearch =
      inv.studentName.toLowerCase().includes(search.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(search.toLowerCase()) ||
      inv.className.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'All' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCollectedPKR = feeInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + inv.netAmountPKR, 0);

  const totalPendingPKR = feeInvoices
    .filter((inv) => inv.status !== 'Paid')
    .reduce((sum, inv) => sum + inv.netAmountPKR, 0);

  const handleProcessPayment = () => {
    if (!paymentGatewayModal) return;
    onPayInvoice(paymentGatewayModal.id, paymentMethod);
    setPaymentGatewayModal(null);
    alert(`Payment of PKR ${paymentGatewayModal.netAmountPKR.toLocaleString()} via ${paymentMethod} verified successfully!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            Pakistani Rupee (PKR) Fee & Billing Portal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Issue fee vouchers, track outstanding balances, apply sibling discounts, and process online payments
          </p>
        </div>
      </div>

      {/* Summary Metrics (PKR) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Total Collected (PKR)</p>
          <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            Rs. {totalCollectedPKR.toLocaleString()}
          </h3>
          <p className="text-[11px] text-slate-400 mt-1">August Term Payments Verified</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Outstanding Balance (PKR)</p>
          <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
            Rs. {totalPendingPKR.toLocaleString()}
          </h3>
          <p className="text-[11px] text-rose-500 font-medium mt-1">Due before Aug 15th</p>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <p className="text-xs font-semibold text-slate-500">Payment Gateways Ready</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">EasyPaisa</span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold">JazzCash</span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">1Link / HBL</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="relative max-w-xs flex-1">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice number or student..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border rounded-xl font-semibold"
        >
          <option value="All">All Invoices</option>
          <option value="Paid">Paid</option>
          <option value="Pending">Pending</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>

      {/* Invoices Table */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase">
                <th className="p-3.5 pl-4">Voucher No</th>
                <th className="p-3.5">Student Name</th>
                <th className="p-3.5">Class</th>
                <th className="p-3.5">Month</th>
                <th className="p-3.5 text-right">Net Amount (PKR)</th>
                <th className="p-3.5 text-center">Due Date</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5 text-right pr-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 pl-4 font-bold text-slate-900 dark:text-white font-mono">{inv.invoiceNo}</td>
                  <td className="p-3.5 font-bold text-slate-800 dark:text-slate-200">{inv.studentName}</td>
                  <td className="p-3.5 text-slate-600">{inv.className}</td>
                  <td className="p-3.5 text-slate-500">{inv.month}</td>
                  <td className="p-3.5 text-right font-black text-slate-900 dark:text-white">
                    Rs. {inv.netAmountPKR.toLocaleString()}
                  </td>
                  <td className="p-3.5 text-center text-slate-500">{inv.dueDate}</td>
                  <td className="p-3.5 text-center">
                    <span
                      className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] ${
                        inv.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : inv.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right pr-4">
                    {inv.status !== 'Paid' ? (
                      <button
                        onClick={() => setPaymentGatewayModal(inv)}
                        className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs shadow-xs"
                      >
                        Pay Online
                      </button>
                    ) : (
                      <button
                        onClick={() => setSelectedInvoice(inv)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs"
                      >
                        Print Voucher
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Payment Modal */}
      {paymentGatewayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setPaymentGatewayModal(null)} />
          <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Pay Fee Voucher Online</h3>
            <p className="text-xs text-slate-500">
              Voucher: <span className="font-semibold text-slate-800 dark:text-slate-200">{paymentGatewayModal.invoiceNo}</span> • Amount: <span className="font-extrabold text-teal-700">PKR {paymentGatewayModal.netAmountPKR.toLocaleString()}</span>
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-600 dark:text-slate-300">Select Gateway:</label>
              {(['EasyPaisa', 'JazzCash', 'Bank Transfer'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`w-full p-3 rounded-2xl border text-left font-bold flex items-center justify-between transition-all ${
                    paymentMethod === method
                      ? 'bg-teal-50 dark:bg-teal-950 border-teal-600 text-teal-900 dark:text-teal-200'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200'
                  }`}
                >
                  <span>{method}</span>
                  {paymentMethod === method && <CheckCircle2 className="w-4 h-4 text-teal-600" />}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <button onClick={() => setPaymentGatewayModal(null)} className="px-4 py-2 text-xs font-bold text-slate-500">
                Cancel
              </button>
              <button onClick={handleProcessPayment} className="px-4 py-2 text-xs font-bold bg-teal-700 text-white rounded-xl">
                Confirm PKR Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
