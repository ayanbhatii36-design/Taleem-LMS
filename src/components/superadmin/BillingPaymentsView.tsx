import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Receipt, 
  Search, 
  Filter, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  RefreshCw, 
  RotateCcw, 
  FileText, 
  DollarSign, 
  Eye, 
  Building2, 
  Printer, 
  X,
  ShieldCheck,
  TrendingUp,
  FileSpreadsheet
} from 'lucide-react';
import { PaymentTransaction, PaymentStatus, PaymentMethod } from '../../types/superAdmin';

interface BillingPaymentsViewProps {
  transactions: PaymentTransaction[];
  onRefundTransaction: (txId: string, reason: string) => void;
  onRetryPayment: (txId: string) => void;
}

export const BillingPaymentsView: React.FC<BillingPaymentsViewProps> = ({
  transactions,
  onRefundTransaction,
  onRetryPayment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [selectedInvoice, setSelectedInvoice] = useState<PaymentTransaction | null>(null);
  const [refundTargetTx, setRefundTargetTx] = useState<PaymentTransaction | null>(null);
  const [refundReason, setRefundReason] = useState('');

  // Financial Metrics in PKR
  const totalCollectedPKR = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Paid')
      .reduce((acc, t) => acc + t.netAmountPKR, 0);
  }, [transactions]);

  const pendingCollectionPKR = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Pending' || t.status === 'Failed')
      .reduce((acc, t) => acc + t.netAmountPKR, 0);
  }, [transactions]);

  const totalRefundedPKR = useMemo(() => {
    return transactions
      .filter(t => t.status === 'Refunded')
      .reduce((acc, t) => acc + t.netAmountPKR, 0);
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = 
        tx.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.transactionRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.schoolName.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;
      const matchesMethod = methodFilter === 'All' || tx.paymentMethod === methodFilter;

      return matchesSearch && matchesStatus && matchesMethod;
    });
  }, [transactions, searchQuery, statusFilter, methodFilter]);

  const handleExportCSV = () => {
    const headers = ['Invoice No', 'Transaction Ref', 'School Name', 'Amount PKR', 'Discount PKR', 'Net PKR', 'Method', 'Status', 'Date', 'Gateway Ref'];
    const rows = filteredTransactions.map(t => [
      t.invoiceNo,
      t.transactionRef,
      `"${t.schoolName}"`,
      t.amountPKR,
      t.discountPKR,
      t.netAmountPKR,
      t.paymentMethod,
      t.status,
      t.date,
      t.gatewayRef || ''
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `TaleemLM_Invoices_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleConfirmRefund = () => {
    if (refundTargetTx) {
      onRefundTransaction(refundTargetTx.id, refundReason || 'Standard billing adjustment requested');
      setRefundTargetTx(null);
      setRefundReason('');
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              SaaS Billing & Invoicing
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              Pakistani Banking & Gateways
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Reconcile 1Link 1Bill, JazzCash, EasyPaisa, Raast, and direct bank settlement transfers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Invoices CSV</span>
          </button>
        </div>
      </div>

      {/* Financial KPIs Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            Total Collected (YTD)
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            PKR {(totalCollectedPKR / 1000000).toFixed(2)}M
          </div>
          <div className="mt-2 text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>97.2% Settlement Rate</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            Pending / In-Transit
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 font-mono">
            PKR {pendingCollectionPKR.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Awaiting 1Link / Wallet clearance
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            Total Invoices Issued
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            {transactions.length} Invoices
          </div>
          <div className="mt-2 text-[11px] text-teal-600 font-semibold">
            Auto-Invoicing Active
          </div>
        </div>

        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">
            Refunds Processed
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white font-mono">
            PKR {totalRefundedPKR.toLocaleString()}
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Tier adjustments & credits
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice #, TXN reference, school name..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Payment Method Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Gateway:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="All">All Payment Channels</option>
              <option value="1Link 1Bill">1Link 1Bill</option>
              <option value="JazzCash">JazzCash</option>
              <option value="EasyPaisa">EasyPaisa</option>
              <option value="Bank Transfer (Meezan/HBL)">Bank Transfer (Meezan/HBL)</option>
              <option value="Raast">Raast (State Bank)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase">
              <tr>
                <th className="py-3.5 px-5">Invoice & Ref</th>
                <th className="py-3.5 px-4">School Tenant</th>
                <th className="py-3.5 px-4">Amount (PKR)</th>
                <th className="py-3.5 px-4">Payment Method</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date & Gateway Ref</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-5">
                    <button
                      onClick={() => setSelectedInvoice(tx)}
                      className="font-mono font-bold text-teal-700 dark:text-teal-400 hover:underline block text-left"
                    >
                      {tx.invoiceNo}
                    </button>
                    <span className="font-mono text-[10px] text-slate-400">
                      {tx.transactionRef}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                    {tx.schoolName}
                  </td>

                  <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-white">
                    PKR {tx.netAmountPKR.toLocaleString()}
                    {tx.discountPKR > 0 && (
                      <div className="text-[10px] text-emerald-600 font-normal">
                        -PKR {tx.discountPKR.toLocaleString()} discount
                      </div>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                    <div className="font-medium">{tx.paymentMethod}</div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      tx.status === 'Paid'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : tx.status === 'Failed'
                        ? 'bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300'
                        : tx.status === 'Refunded'
                        ? 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                        : 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {tx.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="text-slate-800 dark:text-slate-200">{tx.date}</div>
                    <div className="text-[10px] font-mono text-slate-400">{tx.gatewayRef || 'Pending Settlement'}</div>
                  </td>

                  <td className="py-3.5 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedInvoice(tx)}
                        className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-teal-600"
                        title="View & Print Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {tx.status === 'Failed' && (
                        <button
                          onClick={() => onRetryPayment(tx.id)}
                          className="px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-[11px] flex items-center gap-1"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Retry</span>
                        </button>
                      )}

                      {tx.status === 'Paid' && (
                        <button
                          onClick={() => setRefundTargetTx(tx)}
                          className="p-1.5 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-600"
                          title="Process Partial / Full Refund"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal Preview */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSelectedInvoice(null)} />

          <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Official SaaS Invoice {selectedInvoice.invoiceNo}
                </h3>
              </div>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs font-medium">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-extrabold text-sm text-teal-900 dark:text-teal-200">TaleemLM SaaS EdTech (Pvt) Ltd</div>
                  <div className="text-slate-400">NTN: 8849102-1 • Lahore, Pakistan</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900 dark:text-white">Status: {selectedInvoice.status}</div>
                  <div className="text-slate-400">Issued: {selectedInvoice.date}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1">
                <div className="text-[10px] uppercase font-bold text-slate-400">Billed To</div>
                <div className="font-bold text-slate-900 dark:text-white">{selectedInvoice.schoolName}</div>
                <div className="text-slate-400">Gateway: {selectedInvoice.paymentMethod}</div>
              </div>

              <div className="border-t border-b border-slate-100 dark:border-slate-800 py-3 space-y-2">
                <div className="flex justify-between">
                  <span>Subscription Base Fee:</span>
                  <span className="font-mono font-bold">PKR {selectedInvoice.amountPKR.toLocaleString()}</span>
                </div>
                {selectedInvoice.discountPKR > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount Applied:</span>
                    <span className="font-mono">-PKR {selectedInvoice.discountPKR.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-sm text-slate-900 dark:text-white pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span>Net Total Settled:</span>
                  <span className="font-mono text-teal-700 dark:text-teal-300">PKR {selectedInvoice.netAmountPKR.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF Invoice</span>
              </button>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {refundTargetTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setRefundTargetTx(null)} />

          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 z-10">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-red-600" />
              <span>Issue Settlement Refund</span>
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Refund PKR {refundTargetTx.netAmountPKR.toLocaleString()} to {refundTargetTx.schoolName} via original gateway.
            </p>

            <div className="mt-4 space-y-3 text-xs font-medium">
              <label className="block text-slate-700 dark:text-slate-300 font-bold">Reason for Refund:</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                placeholder="e.g. Campus downgraded mid-cycle or dual transaction settlement correction"
                className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl"
                rows={3}
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setRefundTargetTx(null)} className="px-4 py-2 rounded-xl text-slate-500 font-semibold text-xs">
                Cancel
              </button>
              <button onClick={handleConfirmRefund} className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                Confirm & Issue Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
