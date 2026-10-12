import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Download,
} from 'lucide-react';
import { paymentService } from '../../services';
import { Payment } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchFilterBar } from '../../components/common/SearchFilterBar';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { useToast } from '../../contexts/ToastContext';
import { formatLKR, formatDateTime } from '../../utils/formatters';

export const PaymentListPage: React.FC = () => {
  const { showToast } = useToast();

  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Refund dialog
  const [refundPaymentId, setRefundPaymentId] = useState<string | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    const data = await paymentService.getAll();
    setPayments(data);
    setLoading(false);
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const handleConfirmRefund = async () => {
    if (!refundPaymentId) return;
    await paymentService.updateStatus(refundPaymentId, 'Refunded');
    showToast(`Payment #${refundPaymentId} marked as Refunded.`, 'success');
    setRefundPaymentId(null);
    loadPayments();
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.bookingReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.passengerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.receiptNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || p.paymentStatus === statusFilter;
    return matchesSearch && matchesMethod && matchesStatus;
  });

  const totalCollected = payments
    .filter((p) => p.paymentStatus === 'Paid')
    .reduce((sum, p) => sum + p.amountLkr, 0);

  const totalRefunded = payments
    .filter((p) => p.paymentStatus === 'Refunded')
    .reduce((sum, p) => sum + p.amountLkr, 0);

  const pendingCount = payments.filter((p) => p.paymentStatus === 'Pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CreditCard className="w-7 h-7 text-teal-400" />
          <span>Payment Processing & Revenue Ledger</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Monitor digital gateway settlements, cashier collections, transaction receipts, and customer refunds
        </p>
      </div>

      {/* Financial Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Net Revenue</span>
          <span className="text-2xl font-black text-teal-400 font-mono">{formatLKR(totalCollected)}</span>
          <p className="text-[10px] text-slate-400">Successfully authorized payments</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Total Refunds Issued</span>
          <span className="text-2xl font-black text-purple-400 font-mono">{formatLKR(totalRefunded)}</span>
          <p className="text-[10px] text-slate-400">Reversals for cancelled passenger bookings</p>
        </div>

        <div className="p-5 bg-slate-900 border border-slate-800 rounded-3xl space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase block">Pending Settlement</span>
          <span className="text-2xl font-black text-amber-400 font-mono">{pendingCount} transactions</span>
          <p className="text-[10px] text-slate-400">Awaiting counter confirmation</p>
        </div>
      </div>

      {/* Filter Bar */}
      <SearchFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        placeholder="Search by transaction reference, receipt number, or passenger..."
        filters={[
          {
            label: 'Method',
            value: methodFilter,
            options: [
              { label: 'All Methods', value: 'ALL' },
              { label: 'Card (Visa/Master)', value: 'Card' },
              { label: 'Bank Transfer / IPG', value: 'Bank Transfer' },
              { label: 'Cash Counter', value: 'Cash' },
            ],
            onChange: setMethodFilter,
          },
          {
            label: 'Status',
            value: statusFilter,
            options: [
              { label: 'All Statuses', value: 'ALL' },
              { label: 'Paid / Completed', value: 'Paid' },
              { label: 'Pending', value: 'Pending' },
              { label: 'Refunded', value: 'Refunded' },
              { label: 'Failed', value: 'Failed' },
            ],
            onChange: setStatusFilter,
          },
        ]}
      />

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="px-5 py-4">Receipt & Reference</th>
                <th className="px-5 py-4">Booking & Passenger</th>
                <th className="px-5 py-4">Method & Channel</th>
                <th className="px-5 py-4">Amount</th>
                <th className="px-5 py-4">Payment Status</th>
                <th className="px-5 py-4">Timestamp</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    No payment records match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-4 font-mono">
                      <div className="space-y-0.5">
                        <span className="font-bold text-white text-xs">{p.receiptNumber}</span>
                        <p className="text-[10px] text-slate-400">Ref: {p.referenceNumber}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-teal-400 font-bold block">
                          #{p.bookingReference}
                        </span>
                        <p className="font-semibold text-white">{p.passengerName}</p>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-semibold inline-block">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-teal-400 text-sm">
                      {formatLKR(p.amountLkr)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={p.paymentStatus} />
                    </td>

                    <td className="px-5 py-4 font-mono text-slate-400 text-[11px]">
                      {formatDateTime(p.transactionDate)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {p.paymentStatus === 'Paid' && (
                        <button
                          onClick={() => setRefundPaymentId(p.id)}
                          className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-800/40 text-xs font-semibold cursor-pointer inline-flex items-center gap-1 transition-colors"
                          title="Process Refund"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Refund</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Refund Confirmation */}
      <ConfirmDialog
        isOpen={!!refundPaymentId}
        onClose={() => setRefundPaymentId(null)}
        onConfirm={handleConfirmRefund}
        title="Authorize Customer Refund"
        message="Are you sure you want to process a full refund for this transaction? The corresponding amount will be reversed and ledger logged."
      />
    </div>
  );
};
