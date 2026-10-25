import { useMemo, useState } from 'react';
import {
  ArrowDownToLine,
  CalendarDays,
  CreditCard,
  Download,
  Receipt,
  Search,
  Wallet
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Primitives';
import { SectionCard, SoftStat, formatDay, inr } from './shared/StudentTabKit';
import { MOCK_PAYMENTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const MODES = ['All', 'UPI', 'Net banking', 'Card', 'Wallet'];

export const StudentPaymentHistoryTab = ({ setTab, triggerPopup }) => {
  const [query, setQuery] = useState('');
  const [mode, setMode] = useState('All');

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return MOCK_PAYMENTS.filter((payment) => {
      const matchesQuery =
        !value ||
        payment.description.toLowerCase().includes(value) ||
        payment.reference.toLowerCase().includes(value);
      const matchesMode = mode === 'All' || payment.mode.toLowerCase().includes(mode.toLowerCase());
      return matchesQuery && matchesMode;
    });
  }, [query, mode]);

  const total = MOCK_PAYMENTS.reduce((sum, payment) => sum + payment.amount, 0);
  const latest = MOCK_PAYMENTS[0];

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

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Resource planning"
        title="Payment history"
        description="Every fee payment with mode, reference number and downloadable receipt."
        icon={Receipt}
        tone="emerald"
        actions={
          <>
            <ButtonExport onClick={exportCsv} />
            <button
              onClick={() => setTab('fees')}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-3 py-1.5 text-[11px] font-bold font-jost text-white hover:bg-emerald-800"
            >
              <Wallet size={13} /> Pay dues
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Lifetime paid" value={inr(total)} hint="This academic year" icon={CreditCard} tone="emerald" />
        <SoftStat label="Transactions" value={MOCK_PAYMENTS.length} hint="All successful" icon={Receipt} tone="blue" />
        <SoftStat label="Last payment" value={formatDay(latest.date, 'd MMM')} hint={inr(latest.amount)} icon={CalendarDays} tone="indigo" />
        <SoftStat label="Average" value={inr(Math.round(total / MOCK_PAYMENTS.length))} hint="Per transaction" icon={ArrowDownToLine} tone="violet" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search description or reference…" className="w-full sm:max-w-xs" tone="teal" />
        <div className="flex flex-wrap items-center gap-1">
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
                {['Date', 'Description', 'Mode', 'Reference', 'Amount', 'Status', ''].map((head) => (
                  <th key={head} className="border-b border-slate-100 px-3 py-2.5 text-[9px] font-bold uppercase tracking-wide text-slate-500">
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => (
                <tr key={payment.id} className="border-b border-slate-50 last:border-0 hover:bg-emerald-50/20">
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
                  <td className="px-3 py-2.5 text-right">
                    <button
                      onClick={() => triggerPopup?.(`Receipt for ${payment.reference} downloaded.`, 'success')}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[8.5px] font-bold text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
                    >
                      <Download size={10} /> Receipt
                    </button>
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
            <p className="mt-1 text-xs text-slate-500">Try another payment mode or clear the search.</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/60 px-3 py-2.5">
            <p className="text-[9px] font-semibold text-slate-500">
              Showing {filtered.length} of {MOCK_PAYMENTS.length} transactions
            </p>
            <p className="text-[9px] font-bold text-deepNavy">
              Filtered total <span className="ml-1 tabular">{inr(filtered.reduce((sum, payment) => sum + payment.amount, 0))}</span>
            </p>
          </div>
        )}
      </SectionCard>

      <div className="flex items-start gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5 shadow-2xs">
        <Badge tone="slate">Note</Badge>
        <p className="text-[9px] font-semibold leading-relaxed text-slate-500">
          Transactions older than the current academic year are archived. Contact the accounts office for a consolidated
          statement or a duplicate receipt.
        </p>
      </div>
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
