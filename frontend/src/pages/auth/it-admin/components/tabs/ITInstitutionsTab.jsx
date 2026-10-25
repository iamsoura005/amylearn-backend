import { useMemo, useState } from 'react';
import { Building2, Eye, Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips, FormField, inputClass } from '@/components/portal/PortalKit';
import { MOCK_INSTITUTIONS } from '@/pages/auth/it-admin/constants/itAdminConstants';

const STATUS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'live', label: 'Live', count: MOCK_INSTITUTIONS.filter((campus) => campus.status === 'live').length },
  { id: 'onboarding', label: 'Onboarding', count: MOCK_INSTITUTIONS.filter((campus) => campus.status === 'onboarding').length },
  { id: 'suspended', label: 'Suspended', count: MOCK_INSTITUTIONS.filter((campus) => campus.status === 'suspended').length }
];

const PLAN_TONES = {
  Enterprise: 'bg-blue-50 text-brandBlue',
  Growth: 'bg-violet-50 text-violet-700',
  Essential: 'bg-teal-50 text-teal-700'
};

const ITInstitutionsTab = ({ triggerPopup, setTab }) => {
  const [status, setStatus] = useState('all');
  const [query, setQuery] = useState('');
  const [campus, setCampus] = useState(MOCK_INSTITUTIONS);
  const [viewing, setViewing] = useState(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', code: '', city: '', plan: 'Growth', seats: 500 });

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return campus.filter((item) => {
      const matchesStatus = status === 'all' || item.status === status;
      const matchesQuery = !value || item.name.toLowerCase().includes(value) || item.code.toLowerCase().includes(value) || item.city.toLowerCase().includes(value);
      return matchesStatus && matchesQuery;
    });
  }, [campus, status, query]);

  const createTenant = (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      triggerPopup('Institution name and code are required.', 'error');
      return;
    }
    const next = {
      id: form.code.toLowerCase(),
      code: form.code.toUpperCase(),
      name: form.name,
      city: form.city || 'TBD',
      plan: form.plan,
      students: 0,
      seats: Number(form.seats) || 0,
      status: 'onboarding',
      joined: new Date().toISOString().slice(0, 10),
      admin: 'Pending assignment'
    };
    setCampus((current) => [next, ...current]);
    triggerPopup(`${next.name} created. Onboarding checklist has been issued.`, 'success');
    setAdding(false);
    setForm({ name: '', code: '', city: '', plan: 'Growth', seats: 500 });
  };

  const toggleSuspend = () => {
    if (!viewing) return;
    const nextStatus = viewing.status === 'suspended' ? 'live' : 'suspended';
    setCampus((current) => current.map((item) => (item.id === viewing.id ? { ...item, status: nextStatus } : item)));
    triggerPopup(
      nextStatus === 'suspended'
        ? `${viewing.name} suspended. All tenant logins are blocked until restored.`
        : `${viewing.name} restored. Logins are active again.`,
      nextStatus === 'suspended' ? 'error' : 'success'
    );
    setViewing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Tenants"
        title="Institutions"
        description="Every campus on the platform — plans, capacity and health."
        icon={Building2}
        tone="blue"
        actions={
          <button
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-brandBlue px-4 py-2.5 text-[11px] font-bold text-white hover:bg-brand-700"
          >
            <Plus size={13} /> Onboard institution
          </button>
        }
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} tone="blue" />
        <label className="relative flex w-full max-w-xs items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search name, code or city…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <SectionCard title="Campus directory" description="Click a row for tenant actions" icon={Building2} tone="blue">
        <DataTable
          columns={[
            {
              key: 'code',
              label: 'Code',
              render: (row) => <span className="grid h-6 w-12 place-items-center rounded-md bg-blue-50 text-[10px] font-bold text-brandBlue">{row.code}</span>
            },
            { key: 'name', label: 'Institution', render: (row) => <span className="font-bold text-deepNavy">{row.name}</span> },
            { key: 'city', label: 'City' },
            {
              key: 'plan',
              label: 'Plan',
              render: (row) => <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${PLAN_TONES[row.plan] || 'bg-slate-100 text-slate-600'}`}>{row.plan}</span>
            },
            { key: 'students', label: 'Students', render: (row) => <span className="tabular">{row.students.toLocaleString('en-IN')}</span> },
            { key: 'seats', label: 'Seats', render: (row) => <span className="tabular">{row.seats.toLocaleString('en-IN')}</span> },
            { key: 'joined', label: 'Joined' },
            { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
            {
              key: 'actions',
              label: '',
              sortable: false,
              render: (row) => (
                <button
                  onClick={() => setViewing(row)}
                  className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-brandBlue"
                  aria-label={`View ${row.name}`}
                >
                  <Eye size={13} />
                </button>
              )
            }
          ]}
          rows={rows}
          keyField="id"
          footer={`${rows.length} institutions · total capacity ${campus.reduce((sum, item) => sum + item.seats, 0).toLocaleString('en-IN')} seats`}
        />
      </SectionCard>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.name || ''}
        description={`${viewing?.code} · ${viewing?.plan} plan · joined ${viewing?.joined}`}
        tone="blue"
        footer={
          viewing ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => {
                  triggerPopup(`Opening the ${viewing.code} tenant console in a new session.`, 'info');
                  setViewing(null);
                }}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                Open tenant console
              </button>
              <button
                onClick={toggleSuspend}
                className={`rounded-xl px-3.5 py-2 text-[11px] font-bold ${
                  viewing.status === 'suspended'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : 'border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100'
                }`}
              >
                {viewing.status === 'suspended' ? 'Restore tenant' : 'Suspend tenant'}
              </button>
            </div>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'City', value: viewing.city },
                { label: 'Students', value: viewing.students.toLocaleString('en-IN') },
                { label: 'Seat capacity', value: viewing.seats.toLocaleString('en-IN') },
                { label: 'Usage', value: viewing.students ? `${Math.round((viewing.students / viewing.seats) * 100)}%` : '—' }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy tabular">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5">
              <span className="text-[10px] font-semibold text-slate-500">Campus admin</span>
              <span className="text-[10px] font-bold text-deepNavy">{viewing.admin}</span>
            </div>
            <p className="rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 text-[9px] font-semibold leading-snug text-amber-700">
              Suspension blocks all tenant logins immediately. Data is retained and restored on reactivation.
            </p>
          </div>
        ) : null}
      </Modal>

      <Modal
        open={adding}
        onClose={() => setAdding(false)}
        title="Onboard institution"
        description="Creates the tenant, default roles and the onboarding checklist."
        tone="blue"
        footer={
          <button
            onClick={createTenant}
            className="rounded-xl bg-brandBlue px-4 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
          >
            Create tenant
          </button>
        }
      >
        <form onSubmit={createTenant} className="grid gap-3 sm:grid-cols-2">
          <FormField label="Institution name *" className="sm:col-span-2">
            <input value={form.name} onChange={(event) => setForm((value) => ({ ...value, name: event.target.value }))} placeholder="e.g. Riverside Institute of Technology" className={inputClass} />
          </FormField>
          <FormField label="Tenant code *">
            <input value={form.code} onChange={(event) => setForm((value) => ({ ...value, code: event.target.value.toUpperCase() }))} placeholder="RST" maxLength={4} className={inputClass} />
          </FormField>
          <FormField label="City">
            <input value={form.city} onChange={(event) => setForm((value) => ({ ...value, city: event.target.value }))} placeholder="Bengaluru" className={inputClass} />
          </FormField>
          <FormField label="Plan">
            <select value={form.plan} onChange={(event) => setForm((value) => ({ ...value, plan: event.target.value }))} className={inputClass}>
              {['Essential', 'Growth', 'Enterprise'].map((plan) => (
                <option key={plan}>{plan}</option>
              ))}
            </select>
          </FormField>
          <FormField label="Seat capacity">
            <input value={form.seats} onChange={(event) => setForm((value) => ({ ...value, seats: event.target.value }))} type="number" min={1} className={inputClass} />
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default ITInstitutionsTab;
