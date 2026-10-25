import { useState } from 'react';
import {
  BadgeCheck,
  CreditCard,
  History,
  Landmark,
  Plus,
  Receipt,
  ShieldCheck,
  Smartphone,
  Star,
  Trash2,
  Wallet
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { InfoRow } from '@/components/common/StatCard';
import { SectionCard, SoftStat, formatDay, inr } from './shared/StudentTabKit';
import { MOCK_PAYMENT_METHODS, MOCK_PAYMENTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const ICONS = { UPI: Smartphone, Bank: Landmark, Wallet: Wallet, Card: CreditCard };

export const StudentPaymentDetailsTab = ({ session, setTab, triggerPopup }) => {
  const [methods, setMethods] = useState(MOCK_PAYMENT_METHODS);
  const [addOpen, setAddOpen] = useState(false);
  const [identity, setIdentity] = useState({
    name: session?.name || 'Aarav Sharma',
    email: session?.email || 'aarav.sharma@student.nbr.edu',
    phone: session?.phone || '+91 98450 22118',
    address: session?.address || '24, 3rd Cross, Jayanagar 4th Block, Bengaluru 560011'
  });
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ type: 'UPI', label: '', detail: '' });

  const setPrimary = (id) => {
    setMethods((prev) => prev.map((method) => ({ ...method, primary: method.id === id })));
    triggerPopup?.('Default payment method updated.', 'success');
  };

  const remove = (id) => {
    setMethods((prev) => prev.filter((method) => method.id !== id));
    triggerPopup?.('Payment method removed from your account.', 'info');
  };

  const add = () => {
    if (!form.label.trim() || !form.detail.trim()) {
      triggerPopup?.('Add a label and reference for the new payment method.', 'warning');
      return;
    }
    setMethods((prev) => [
      ...prev,
      { id: `pm-${Date.now()}`, label: form.label.trim(), detail: form.detail.trim(), type: form.type, primary: prev.length === 0 }
    ]);
    setForm({ type: 'UPI', label: '', detail: '' });
    setAddOpen(false);
    triggerPopup?.('Payment method added successfully.', 'success');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Resource planning"
        title="Payment details"
        description="Saved methods, billing identity and downloadable receipts for every campus payment."
        icon={CreditCard}
        tone="emerald"
        actions={<Badge tone="emerald" dot>Verified</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Saved methods" value={methods.length} hint="UPI, bank and wallet" icon={CreditCard} tone="emerald" />
        <SoftStat label="Receipts" value={MOCK_PAYMENTS.length} hint="This academic year" icon={Receipt} tone="blue" />
        <SoftStat label="Lifetime paid" value={inr(MOCK_PAYMENTS.reduce((sum, payment) => sum + payment.amount, 0))} hint="Across 4 payments" icon={BadgeCheck} tone="indigo" />
        <SoftStat label="Security" value="2FA" hint="Enabled on sign-in" icon={ShieldCheck} tone="violet" />
      </div>

      <div className="grid gap-3 xl:grid-cols-5">
        <SectionCard
          title="Saved payment methods"
          description="Used when you pay fees from the portal"
          icon={CreditCard}
          tone="emerald"
          className="xl:col-span-3"
          action={
            <Button size="xs" icon={Plus} onClick={() => setAddOpen(true)}>
              Add
            </Button>
          }
          bodyClassName="p-3"
        >
          <div className="space-y-2">
            {methods.map((method) => {
              const Icon = ICONS[method.type] || CreditCard;
              return (
                <div
                  key={method.id}
                  className={`flex items-center gap-2.5 rounded-xl border p-3 ${
                    method.primary ? 'border-emerald-200 bg-emerald-50/40' : 'border-slate-100'
                  }`}
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${method.primary ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    <Icon size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-[11px] font-bold text-deepNavy">{method.label}</p>
                      {method.primary ? <Badge tone="emerald">Default</Badge> : null}
                    </div>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-500">{method.detail} · {method.type}</p>
                  </div>
                  {!method.primary ? (
                    <button
                      onClick={() => setPrimary(method.id)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-emerald-300 hover:text-emerald-600"
                      aria-label={`Make ${method.label} default`}
                      title="Make default"
                    >
                      <Star size={12} />
                    </button>
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-emerald-100 text-emerald-700">
                      <Star size={12} className="fill-emerald-600 text-emerald-600" />
                    </span>
                  )}
                  <button
                    onClick={() => remove(method.id)}
                    className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-600"
                    aria-label={`Remove ${method.label}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            {!methods.length ? (
              <p className="py-6 text-center text-[10.5px] font-semibold text-slate-500">No saved methods. Add one to pay fees faster.</p>
            ) : null}
          </div>
          <div className="mt-2.5 flex items-start gap-2 rounded-xl bg-slate-50 px-2.5 py-2">
            <ShieldCheck size={13} className="mt-0.5 shrink-0 text-slate-400" />
            <p className="text-[8.5px] font-semibold leading-relaxed text-slate-500">
              AmyLearn never stores full card numbers or UPI PINs. Methods are tokenised by the payment gateway.
            </p>
          </div>
        </SectionCard>

        <SectionCard
          title="Billing identity"
          description="Used on every receipt"
          icon={BadgeCheck}
          tone="blue"
          className="xl:col-span-2"
          action={
            <button onClick={() => setEditing((value) => !value)} className="text-[9px] font-bold text-blue-700 hover:underline">
              {editing ? 'Done' : 'Edit'}
            </button>
          }
          bodyClassName="p-3.5"
        >
          {editing ? (
            <div className="space-y-2">
              {[
                { key: 'name', label: 'Full name' },
                { key: 'email', label: 'Email' },
                { key: 'phone', label: 'Phone' },
                { key: 'address', label: 'Billing address' }
              ].map((field) => (
                <label key={field.key} className="block">
                  <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{field.label}</span>
                  <input
                    value={identity[field.key]}
                    onChange={(event) => setIdentity((prev) => ({ ...prev, [field.key]: event.target.value }))}
                    className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-1.5 text-[10px] font-semibold text-deepNavy focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                </label>
              ))}
              <Button
                size="xs"
                className="w-full"
                onClick={() => {
                  setEditing(false);
                  triggerPopup?.('Billing identity updated.', 'success');
                }}
              >
                Save changes
              </Button>
            </div>
          ) : (
            <div>
              <p className="text-[12px] font-extrabold text-deepNavy font-jost">{identity.name}</p>
              <p className="text-[9px] font-semibold text-slate-500">{session?.rollNumber || 'NBR2024CS042'} · Semester {session?.semester || 5}</p>
              <div className="mt-2 divide-y divide-slate-50">
                <InfoRow label="Email" value={identity.email} />
                <InfoRow label="Phone" value={identity.phone} />
                <InfoRow label="Address" value={identity.address} />
                <InfoRow label="GST / Tax ID" value="Not applicable" />
              </div>
            </div>
          )}
        </SectionCard>
      </div>

      <SectionCard
        title="Recent receipts"
        description="Download or open the full payment history"
        icon={Receipt}
        tone="indigo"
        action={
          <Button variant="ghost" size="xs" iconRight={History} onClick={() => setTab('payment-history')}>
            Full history
          </Button>
        }
        bodyClassName="p-3"
      >
        <div className="grid gap-2 md:grid-cols-2">
          {MOCK_PAYMENTS.slice(0, 4).map((payment) => (
            <div key={payment.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 p-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                <Receipt size={14} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[10.5px] font-bold text-deepNavy">{payment.description}</p>
                <p className="mt-0.5 text-[8.5px] font-semibold text-slate-500">{formatDay(payment.date, 'd MMM yyyy')} · {payment.reference}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-[10px] font-extrabold text-deepNavy tabular">{inr(payment.amount)}</p>
                <button
                  onClick={() => triggerPopup?.(`Receipt ${payment.reference} downloaded.`, 'success')}
                  className="text-[8px] font-bold text-indigo-700 hover:underline"
                >
                  Receipt
                </button>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add a payment method"
        description="Saved methods are tokenised and can be removed at any time."
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" icon={Plus} onClick={add}>
              Add method
            </Button>
          </>
        }
      >
        <div className="space-y-2.5">
          <div>
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Type</span>
            <div className="mt-1 grid grid-cols-3 gap-1.5">
              {['UPI', 'Bank', 'Card'].map((type) => (
                <button
                  key={type}
                  onClick={() => setForm((prev) => ({ ...prev, type }))}
                  className={`rounded-lg border px-2 py-1.5 text-[10px] font-bold ${
                    form.type === type ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <label className="block">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Label</span>
            <input
              value={form.label}
              onChange={(event) => setForm((prev) => ({ ...prev, label: event.target.value }))}
              placeholder="e.g. UPI · HDFC Bank"
              className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-[10.5px] font-semibold text-deepNavy placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <label className="block">
            <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Reference</span>
            <input
              value={form.detail}
              onChange={(event) => setForm((prev) => ({ ...prev, detail: event.target.value }))}
              placeholder={form.type === 'UPI' ? 'name@okbank' : form.type === 'Bank' ? '•••• 4412' : '•••• 8841'}
              className="mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-[10.5px] font-semibold text-deepNavy placeholder:text-slate-500 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-100"
            />
          </label>
          <p className="rounded-lg bg-slate-50 px-2.5 py-2 text-[8.5px] font-semibold leading-relaxed text-slate-500">
            For card payments you will be redirected to the secure gateway to complete tokenisation. No card data is stored
            on AmyLearn servers.
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default StudentPaymentDetailsTab;
