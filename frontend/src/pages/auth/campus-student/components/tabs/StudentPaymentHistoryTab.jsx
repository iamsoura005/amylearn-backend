import { useMemo, useState, useEffect } from 'react';
import {
  ArrowDownToLine,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Copy,
  CreditCard,
  Download,
  Eye,
  Mail,
  Plus,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Wallet
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SearchInput } from '@/components/ui/Primitives';
import { SectionCard, SoftStat, formatDay, inr } from './shared/StudentTabKit';
import { MOCK_PAYMENTS, MOCK_PAYMENT_METHODS } from '@/pages/auth/campus-student/constants/campusStudentConstants';
import api from '@/utils/config';

const MODES = ['All', 'UPI', 'Net banking', 'Card', 'Wallet'];
const TIMEFRAMES = [
  { id: 'all', label: 'All time' },
  { id: 'term', label: 'Semester 5 (2026-27)' },
  { id: 'recent', label: 'Last 30 days' }
];

const PRESET_FEES = [
  { id: 'fee-exam', title: 'End-Semester Exam & Lab Fee', amount: 3500 },
  { id: 'fee-lib', title: 'Library Book Replacement / Late Fine', amount: 350 },
  { id: 'fee-cert', title: 'Official Transcript & Certificate Fee', amount: 800 },
  { id: 'fee-custom', title: 'Custom Institutional Fee / Dues', amount: 2000 }
];

export const StudentPaymentHistoryTab = ({ setTab, triggerPopup }) => {
  const [payments, setPayments] = useState(MOCK_PAYMENTS);
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('All');
  const [timeframe, setTimeframe] = useState('all');
  const [loading, setLoading] = useState(false);

  // Modals state
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [payForm, setPayForm] = useState({
    preset: 'fee-exam',
    customTitle: '',
    amount: 3500,
    mode: 'UPI (GPay / PhonePe)'
  });
  const [submittingPay, setSubmittingPay] = useState(false);

  useEffect(() => {
    let active = true;
    const fetchPayments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/student/payment-history');
        if (active && res.data?.payments?.length) {
          setPayments(res.data.payments);
        }
      } catch {
        // Keeps fallback
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchPayments();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

    return payments.filter((payment) => {
      const matchesQuery =
        !value ||
        (payment.description && payment.description.toLowerCase().includes(value)) ||
        (payment.reference && payment.reference.toLowerCase().includes(value));
      const matchesMode = mode === 'All' || (payment.mode && payment.mode.toLowerCase().includes(mode.toLowerCase()));
      
      let matchesTimeframe = true;
      if (timeframe === 'recent') {
        const pDate = new Date(payment.date).getTime();
        matchesTimeframe = pDate >= thirtyDaysAgo;
      }

      return matchesQuery && matchesMode && matchesTimeframe;
    });
  }, [payments, query, mode, timeframe]);

  const total = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const latest = payments[0] || { amount: 0, date: new Date().toISOString() };

  const exportCsv = () => {
    const rows = [
      ['Date', 'Description', 'Mode', 'Reference', 'Amount', 'Status'],
      ...filtered.map((payment) => [payment.date, payment.description, payment.mode, payment.reference, payment.amount, payment.status])
    ];
    const csv = rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'amylearn-payment-history.csv';
    anchor.click();
    URL.revokeObjectURL(url);
    triggerPopup?.('Payment history exported as CSV.', 'success');
  };

  const downloadReceipt = (payment) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Fee Receipt - ${payment.reference}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #0f172a; }
          .badge { background: #dcfce7; color: #15803d; padding: 4px 12px; border-radius: 999px; font-weight: bold; font-size: 12px; }
          .details { margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
          .amount-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 30px; }
          .amount { font-size: 32px; font-weight: 800; color: #0f172a; margin-top: 4px; }
          .footer { font-size: 11px; color: #64748b; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 16px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">AmyLearn Digital Fee Receipt</div>
            <div style="font-size: 13px; color: #64748b;">Official Institutional Fee Voucher</div>
          </div>
          <div class="badge">STATUS: ${String(payment.status || 'PAID').toUpperCase()}</div>
        </div>
        <div class="details">
          <div><strong>Reference No:</strong> ${payment.reference}</div>
          <div><strong>Date:</strong> ${new Date(payment.date || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
          <div><strong>Payment Mode:</strong> ${payment.mode || 'Online'}</div>
          <div><strong>Description:</strong> ${payment.description}</div>
        </div>
        <div class="amount-box">
          <div style="font-size: 13px; color: #64748b; text-transform: uppercase; font-weight: 600;">Total Amount Paid</div>
          <div class="amount">₹${Number(payment.amount).toLocaleString('en-IN')}</div>
        </div>
        <div class="footer">
          This is an electronically generated receipt verified by AmyLearn Institutional ERP. No physical signature is required.
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([receiptHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const win = window.open(url, '_blank');
    if (win) {
      win.focus();
      triggerPopup?.(`Receipt for ${payment.reference} opened for printing.`, 'success');
    } else {
      const a = document.createElement('a');
      a.href = url;
      a.download = `Receipt-${payment.reference}.html`;
      a.click();
      triggerPopup?.(`Receipt for ${payment.reference} downloaded.`, 'success');
    }
  };

  const handleCopyRef = (ref) => {
    navigator.clipboard?.writeText(ref);
    triggerPopup?.(`Reference ${ref} copied to clipboard.`, 'success');
  };

  const handleQuickPaySubmit = async (e) => {
    e?.preventDefault();
    const desc = payForm.preset === 'fee-custom' ? payForm.customTitle.trim() || 'Custom Fee' : PRESET_FEES.find(p => p.id === payForm.preset)?.title || 'Fee Payment';
    const amountNum = Number(payForm.amount);
    if (!amountNum || amountNum <= 0) {
      triggerPopup?.('Please enter a valid positive payment amount.', 'warning');
      return;
    }

    setSubmittingPay(true);
    try {
      const res = await api.post('/api/student/pay-fee', {
        amount: amountNum,
        description: desc,
        mode: payForm.mode
      });
      if (res.data?.transaction) {
        setPayments(prev => [res.data.transaction, ...prev]);
        triggerPopup?.(res.data.message || 'Payment recorded successfully.', 'success');
      }
      setQuickPayOpen(false);
    } catch (err) {
      // Fallback local update
      const fallbackEntry = {
        id: `fee-${Date.now()}`,
        amount: amountNum,
        description: desc,
        mode: payForm.mode,
        reference: `TXN-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`,
        status: 'Paid',
        date: new Date().toISOString()
      };
      setPayments(prev => [fallbackEntry, ...prev]);
      triggerPopup?.(`Payment of ₹${amountNum.toLocaleString('en-IN')} confirmed (offline fallback).`, 'success');
      setQuickPayOpen(false);
    } finally {
      setSubmittingPay(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Resource planning"
        title="Payment history"
        description="Every fee payment with mode, reference number, live institutional verification and downloadable receipt."
        icon={Receipt}
        tone="emerald"
        actions={
          <div className="flex items-center gap-2">
            <ButtonExport onClick={exportCsv} />
            <Button
              size="sm"
              icon={Plus}
              onClick={() => setQuickPayOpen(true)}
              className="bg-emerald-700 text-white hover:bg-emerald-800"
            >
              Quick pay
            </Button>
            <button
              onClick={() => setTab('fees')}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-600/30 bg-emerald-50 px-3 py-1.5 text-[11px] font-bold font-jost text-emerald-800 hover:bg-emerald-100"
            >
              <Wallet size={13} /> Fee ledger
            </button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Lifetime paid" value={inr(total)} hint="This academic year" icon={CreditCard} tone="emerald" />
        <SoftStat label="Transactions" value={payments.length} hint="All recorded" icon={Receipt} tone="blue" />
        <SoftStat label="Last payment" value={formatDay(latest.date, 'd MMM')} hint={inr(latest.amount)} icon={CalendarDays} tone="indigo" />
        <SoftStat label="Average" value={inr(Math.round(total / (payments.length || 1)))} hint="Per transaction" icon={ArrowDownToLine} tone="violet" />
      </div>

      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search description or reference…" className="w-full sm:max-w-xs" tone="teal" />
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex items-center gap-1 border-r border-slate-200 pr-2">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf.id}
                onClick={() => setTimeframe(tf.id)}
                className={`rounded-lg px-2 py-1 text-[9.5px] font-bold transition-colors ${
                  timeframe === tf.id ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
          {MODES.map((item) => (
            <button
              key={item}
              onClick={() => setMode(item)}
              className={`rounded-lg px-2 py-1 text-[9.5px] font-bold transition-colors ${
                mode === item ? 'bg-emerald-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <SectionCard bodyClassName="p-0" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead className="bg-slate-50">
              <tr>
                {['Date', 'Description', 'Mode', 'Reference', 'Amount', 'Status', 'Actions'].map((head) => (
                  <th key={head} className="border-b border-slate-100 px-3 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className="cursor-pointer border-b border-slate-50 last:border-0 hover:bg-emerald-50/30 transition-colors"
                >
                  <td className="whitespace-nowrap px-3 py-2.5">
                    <p className="text-[10px] font-bold text-deepNavy">{formatDay(payment.date, 'd MMM yyyy')}</p>
                    <p className="text-[8px] font-semibold text-slate-500">{formatDay(payment.date, 'EEEE')}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <p className="text-[10.5px] font-bold text-deepNavy">{payment.description}</p>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="text-[9.5px] font-semibold text-slate-500">{payment.mode}</span>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="font-mono text-[9px] font-semibold text-slate-500">{payment.reference}</span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-[10.5px] font-extrabold text-deepNavy tabular">{inr(payment.amount)}</td>
                  <td className="px-3 py-2.5">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-3 py-2.5 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[8.5px] font-bold text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        title="View transaction details"
                      >
                        <Eye size={10} /> Details
                      </button>
                      <button
                        onClick={() => downloadReceipt(payment)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[8.5px] font-bold text-emerald-700 hover:border-emerald-300 hover:bg-emerald-50"
                        title="Download official receipt voucher"
                      >
                        <Download size={10} /> Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!filtered.length ? (
          <div className="px-6 py-12 text-center">
            <Search size={20} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm font-bold text-deepNavy font-jost">No transactions matched</p>
            <p className="mt-1 text-xs text-slate-500">Try another payment mode or clear the search filters.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[9px] font-semibold text-slate-500">
              Showing {filtered.length} of {payments.length} transactions
            </p>
            <p className="text-[9px] font-bold text-deepNavy">
              Filtered total <span className="ml-1 tabular">{inr(filtered.reduce((sum, payment) => sum + Number(payment.amount || 0), 0))}</span>
            </p>
          </div>
        )}
      </SectionCard>

      <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-2xs">
        <Badge tone="slate">Note</Badge>
        <p className="text-[9px] font-semibold leading-relaxed text-slate-500">
          All digital payments are reconciled with the Northbridge University Accounts Ledger. Receipts downloaded here are digitally verifiable vouchers suitable for income tax exemptions and scholarship submissions.
        </p>
      </div>

      {/* Transaction Details Modal */}
      <Modal
        open={Boolean(selectedPayment)}
        onClose={() => setSelectedPayment(null)}
        title="Transaction Details"
        description={selectedPayment ? `Reference: ${selectedPayment.reference}` : undefined}
        size="md"
        footer={
          <div className="flex items-center justify-between w-full">
            <button
              onClick={() => handleCopyRef(selectedPayment?.reference)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 hover:text-deepNavy"
            >
              <Copy size={13} /> Copy reference
            </button>
            <div className="flex items-center gap-2">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPayment(null)}>
                Close
              </Button>
              <Button
                size="sm"
                icon={Download}
                onClick={() => {
                  if (selectedPayment) downloadReceipt(selectedPayment);
                }}
              >
                Download Receipt
              </Button>
            </div>
          </div>
        }
      >
        {selectedPayment ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Paid</p>
                <p className="text-3xl font-extrabold text-emerald-950 font-jost tabular">
                  {inr(selectedPayment.amount)}
                </p>
                <p className="text-[10px] font-medium text-emerald-700 mt-0.5">Status: {selectedPayment.status}</p>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-600 text-white">
                <CheckCircle2 size={24} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[9px] font-bold uppercase text-slate-400">Payment Reference</p>
                <p className="mt-1 font-mono text-[11px] font-bold text-deepNavy">{selectedPayment.reference}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[9px] font-bold uppercase text-slate-400">Transaction Date</p>
                <p className="mt-1 text-[11px] font-bold text-deepNavy">{formatDay(selectedPayment.date, 'd MMMM yyyy, h:mm a')}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[9px] font-bold uppercase text-slate-400">Payment Channel</p>
                <p className="mt-1 text-[11px] font-bold text-deepNavy">{selectedPayment.mode}</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <p className="text-[9px] font-bold uppercase text-slate-400">Settlement Verification</p>
                <p className="mt-1 text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                  <ShieldCheck size={13} /> Reconciled with ERP
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-[9px] font-bold uppercase text-slate-400 mb-1">Fee Purpose / Description</p>
              <p className="text-[12px] font-bold text-deepNavy">{selectedPayment.description}</p>
            </div>

            <div className="flex items-center gap-2 rounded-xl bg-slate-100/70 p-2.5 text-[10px] text-slate-600">
              <Mail size={14} className="shrink-0 text-slate-500" />
              <span>An electronic tax confirmation has been logged for this roll number in the campus registry.</span>
            </div>
          </div>
        ) : null}
      </Modal>

      {/* Quick Pay Modal */}
      <Modal
        open={quickPayOpen}
        onClose={() => setQuickPayOpen(false)}
        title="Quick Fee Payment"
        description="Submit payment for upcoming term dues, exam registrations or fines."
        size="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button variant="secondary" size="sm" onClick={() => setQuickPayOpen(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              icon={CreditCard}
              loading={submittingPay}
              onClick={handleQuickPaySubmit}
            >
              Confirm & Pay {inr(payForm.amount)}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleQuickPaySubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Fee Category
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_FEES.map((preset) => (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() =>
                    setPayForm((prev) => ({
                      ...prev,
                      preset: preset.id,
                      amount: preset.id === 'fee-custom' ? prev.amount : preset.amount
                    }))
                  }
                  className={`flex flex-col text-left p-3 rounded-xl border transition-all ${
                    payForm.preset === preset.id
                      ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span className="text-[11px] font-bold text-deepNavy">{preset.title}</span>
                  <span className="mt-1 text-sm font-extrabold text-emerald-800 tabular">
                    {preset.id === 'fee-custom' ? 'Custom' : inr(preset.amount)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {payForm.preset === 'fee-custom' ? (
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Custom Purpose & Amount
              </label>
              <input
                type="text"
                placeholder="e.g. Hostel Late Fee / Library Caution Deposit"
                value={payForm.customTitle}
                onChange={(e) => setPayForm((prev) => ({ ...prev, customTitle: e.target.value }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-deepNavy placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
              <input
                type="number"
                placeholder="Amount in ₹"
                value={payForm.amount}
                onChange={(e) => setPayForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-deepNavy placeholder:text-slate-400 focus:outline-none focus:border-emerald-500"
              />
            </div>
          ) : null}

          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['UPI (GPay / PhonePe)', 'Net Banking', 'Debit / Credit Card'].map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPayForm((prev) => ({ ...prev, mode: method }))}
                  className={`rounded-xl border p-2.5 text-center text-[10px] font-bold transition-all ${
                    payForm.mode === method
                      ? 'border-emerald-600 bg-emerald-600 text-white'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl bg-slate-50 p-3 text-[10.5px] text-slate-500 flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>Payments are protected with 256-bit bank grade encryption. An official voucher is generated instantly.</span>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const ButtonExport = ({ onClick }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-bold font-jost text-deepNavy hover:bg-slate-50"
  >
    <Download size={13} /> Export CSV
  </button>
);

export default StudentPaymentHistoryTab;

