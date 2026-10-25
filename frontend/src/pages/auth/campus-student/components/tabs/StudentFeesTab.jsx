import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  CreditCard,
  Download,
  Landmark,
  Receipt,
  ShieldCheck,
  Smartphone,
  AlertTriangle,
  Wallet
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Progress } from '@/components/ui/Primitives';
import { Donut } from '@/components/common/Charts';
import { SectionCard, SoftStat, daysUntil, formatDay, inr } from './shared/StudentTabKit';
import { MOCK_FEES, MOCK_PAYMENT_METHODS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const ICONS = { UPI: Smartphone, Bank: Landmark, Wallet: Wallet, Card: CreditCard };

export const StudentFeesTab = ({ setTab, triggerPopup }) => {
  const [fees, setFees] = useState(MOCK_FEES);
  const [paying, setPaying] = useState(null);
  const [method, setMethod] = useState(MOCK_PAYMENT_METHODS[0].id);
  const [processing, setProcessing] = useState(false);

  const totals = useMemo(() => {
    const total = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const paid = fees.reduce((sum, fee) => sum + fee.paid, 0);
    return { total, paid, due: total - paid, percent: Math.round((paid / total) * 100) };
  }, [fees]);

  const pending = fees.filter((fee) => fee.status === 'Pending');
  const nextDue = pending[0];

  const pay = () => {
    if (!paying) return;
    setProcessing(true);
    window.setTimeout(() => {
      setFees((prev) =>
        prev.map((fee) =>
          fee.id === paying.id
            ? { ...fee, paid: fee.amount, status: 'Paid', receipt: `NBR-${fee.term.includes('Laboratory') ? 'LAB' : 'FEE'}-2026-${String(Date.now()).slice(-4)}` }
            : fee
        )
      );
      setProcessing(false);
      setPaying(null);
      triggerPopup?.(`${inr(paying.amount)} paid successfully. A receipt has been added to your payment history.`, 'success');
    }, 800);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Semester 5 · 2026 – 27"
        title="Fees"
        description="Semester dues, examination and laboratory fees with a clear breakdown of what is paid."
        icon={Receipt}
        tone="amber"
        actions={
          nextDue ? (
            <Button size="sm" icon={CreditCard} onClick={() => setPaying(nextDue)}>
              Pay {inr(nextDue.amount)}
            </Button>
          ) : (
            <Badge tone="emerald" dot>All dues cleared</Badge>
          )
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Total billed" value={inr(totals.total)} hint="This academic year" icon={Receipt} tone="slate" />
        <SoftStat label="Paid" value={inr(totals.paid)} hint={`${totals.percent}% of total`} icon={CheckCircle2} tone="emerald" />
        <SoftStat label="Outstanding" value={inr(totals.due)} hint={totals.due ? 'Action needed' : 'Nothing due'} icon={AlertTriangle} tone={totals.due ? 'amber' : 'emerald'} />
        <SoftStat label="Receipts" value={fees.filter((fee) => fee.receipt).length} hint="Downloadable" icon={Download} tone="blue" />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <SectionCard title="Fee schedule" description="Tuition, examination, laboratory and deposits" icon={Receipt} tone="amber" bodyClassName="p-3">
            <div className="space-y-2">
              {fees.map((fee) => (
                <div
                  key={fee.id}
                  className={`flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center ${
                    fee.status === 'Pending' ? 'border-amber-200 bg-amber-50/50' : 'border-slate-100'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="text-[11px] font-bold text-deepNavy">{fee.term}</p>
                      <StatusBadge status={fee.status} />
                    </div>
                    <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">
                      Due {formatDay(fee.dueDate, 'd MMM yyyy')}
                      {fee.receipt ? ` · Receipt ${fee.receipt}` : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] font-extrabold text-deepNavy tabular">{inr(fee.amount)}</p>
                      <p className="text-[8px] font-semibold text-slate-500">{fee.paid ? `${inr(fee.paid)} paid` : 'Not paid'}</p>
                    </div>
                    {fee.status === 'Pending' ? (
                      <Button size="xs" icon={CreditCard} onClick={() => setPaying(fee)}>
                        Pay now
                      </Button>
                    ) : (
                      <button
                        onClick={() => triggerPopup?.(`Receipt ${fee.receipt} downloaded.`, 'success')}
                        className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                        aria-label={`Download receipt ${fee.receipt}`}
                      >
                        <Download size={12} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-2.5 py-2">
              <ShieldCheck size={13} className="mt-0.5 shrink-0 text-slate-400" />
              <p className="text-[8.5px] font-semibold leading-relaxed text-slate-500">
                A late fee of ₹100 per week applies after the due date. Laboratory and examination fees must be reconciled
                before admit cards are released.
              </p>
            </div>
          </SectionCard>
        </div>

        <div className="space-y-3">
          <SectionCard title="Payment summary" description="What you have paid so far" icon={Banknote} tone="emerald" bodyClassName="p-4">
            <Donut
              segments={[
                { label: 'Paid', value: totals.paid, color: '#10B981', display: inr(totals.paid) },
                { label: 'Outstanding', value: totals.due, color: '#F59E0B', display: inr(totals.due) }
              ]}
              centerValue={`${totals.percent}%`}
              centerLabel="Reconciled"
              size={128}
              thickness={13}
            />
            <Progress value={totals.percent} tone="emerald" className="mt-3" thickness="h-1" />
            {nextDue ? (
              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5">
                <p className="text-[9px] font-bold uppercase tracking-wide text-amber-700">Next due</p>
                <p className="mt-0.5 text-[11px] font-extrabold text-deepNavy">{nextDue.term}</p>
                <p className="text-[9px] font-semibold text-amber-700">
                  {inr(nextDue.amount)} · {daysUntil(nextDue.dueDate)} days left
                </p>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 p-2.5">
                <BadgeCheck size={15} className="text-emerald-600" />
                <p className="text-[9.5px] font-bold text-emerald-800">All fees reconciled. Admit card is ready.</p>
              </div>
            )}
          </SectionCard>

          <SectionCard
            title="Saved methods"
            icon={CreditCard}
            tone="indigo"
            action={
              <button onClick={() => setTab('payment-details')} className="text-[9px] font-bold text-indigo-700 hover:underline">
                Manage
              </button>
            }
            bodyClassName="p-2.5"
          >
            <div className="space-y-1.5">
              {MOCK_PAYMENT_METHODS.map((item) => {
                const Icon = ICONS[item.type] || CreditCard;
                return (
                  <div key={item.id} className="flex items-center gap-2 rounded-lg border border-slate-100 px-2.5 py-2">
                    <span className="grid h-6 w-6 place-items-center rounded-md bg-slate-100 text-slate-500">
                      <Icon size={12} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[9.5px] font-bold text-deepNavy">{item.label}</p>
                      <p className="truncate text-[8px] font-semibold text-slate-500">{item.detail}</p>
                    </div>
                    {item.primary ? <Badge tone="emerald">Default</Badge> : null}
                  </div>
                );
              })}
            </div>
          </SectionCard>
        </div>
      </div>

      <Modal
        open={Boolean(paying)}
        onClose={() => setPaying(null)}
        title="Pay campus fee"
        description={paying ? `${paying.term} · due ${formatDay(paying.dueDate)}` : undefined}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setPaying(null)}>
              Cancel
            </Button>
            <Button size="sm" icon={CreditCard} loading={processing} onClick={pay}>
              Pay {paying ? inr(paying.amount) : ''}
            </Button>
          </>
        }
      >
        {paying ? (
          <div className="space-y-3">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-500 p-4 text-white">
              <p className="text-[9px] font-bold uppercase tracking-wider text-white/70">Amount due</p>
              <p className="mt-1 text-3xl font-extrabold leading-none font-jost tabular">{inr(paying.amount)}</p>
              <p className="mt-1.5 text-[9px] font-semibold text-white/80">{paying.term}</p>
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Pay using</p>
              <div className="mt-1 space-y-1.5">
                {MOCK_PAYMENT_METHODS.map((item) => {
                  const Icon = ICONS[item.type] || CreditCard;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setMethod(item.id)}
                      className={`flex w-full items-center gap-2 rounded-xl border px-2.5 py-2 text-left ${
                        method === item.id ? 'border-emerald-300 bg-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      <span className={`grid h-7 w-7 place-items-center rounded-lg ${method === item.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                        <Icon size={13} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[10px] font-bold text-deepNavy">{item.label}</span>
                        <span className="block truncate text-[8.5px] font-semibold text-slate-500">{item.detail}</span>
                      </span>
                      <span className={`h-3.5 w-3.5 rounded-full border-2 ${method === item.id ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span className="text-[9px] font-semibold text-slate-500">Processing fee</span>
              <span className="text-[9px] font-bold text-emerald-700">Waived</span>
            </div>
            <p className="text-[8.5px] leading-relaxed text-slate-500">
              By paying you agree to the campus fee policy. Receipts are issued instantly and emailed to your campus address.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default StudentFeesTab;
