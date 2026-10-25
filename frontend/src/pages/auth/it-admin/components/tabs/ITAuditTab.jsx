import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ClipboardList, Search } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { MOCK_AUDIT_EVENTS } from '@/pages/auth/it-admin/constants/itAdminConstants';

const ACTION_FILTERS = [
  { id: 'all', label: 'All actions' },
  { id: 'tenant', label: 'Tenant' },
  { id: 'feature', label: 'Features' },
  { id: 'role', label: 'Roles' },
  { id: 'ticket', label: 'Tickets' },
  { id: 'billing', label: 'Billing' },
  { id: 'platform', label: 'Platform' }
];

const ACTION_TONES = {
  'tenant.create': 'bg-emerald-50 text-emerald-700',
  'tenant.suspend': 'bg-rose-50 text-rose-700',
  'feature.toggle': 'bg-violet-50 text-violet-700',
  'role.assign': 'bg-blue-50 text-brandBlue',
  'ticket.update': 'bg-amber-50 text-amber-700',
  'billing.invoice': 'bg-teal-50 text-teal-700',
  'platform.update': 'bg-slate-100 text-slate-600'
};

const ITAuditTab = () => {
  const [action, setAction] = useState('all');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const value = query.trim().toLowerCase();
    return MOCK_AUDIT_EVENTS.filter((event) => {
      const matchesAction = action === 'all' || event.action.startsWith(action);
      const matchesQuery =
        !value ||
        event.actor.toLowerCase().includes(value) ||
        event.target.toLowerCase().includes(value) ||
        event.detail.toLowerCase().includes(value);
      return matchesAction && matchesQuery;
    });
  }, [action, query]);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Support · Compliance"
        title="Audit log"
        description="Immutable record of every platform-level change, kept for 180 days."
        icon={ClipboardList}
        tone="blue"
      />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <FilterChips options={ACTION_FILTERS} value={action} onChange={setAction} tone="blue" />
        <label className="relative flex w-full max-w-xs items-center">
          <Search size={14} className="pointer-events-none absolute left-3 text-slate-400" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search actor, target or detail…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-[11px] font-medium text-deepNavy placeholder:text-slate-500 focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </label>
      </div>

      <SectionCard title="Events" description={`${rows.length} matching events`} icon={ClipboardList} tone="blue">
        <DataTable
          columns={[
            {
              key: 'at',
              label: 'When',
              render: (row) => (
                <span className="block">
                  <span className="block text-[10px] font-bold text-deepNavy tabular">{format(new Date(row.at), 'd MMM yyyy')}</span>
                  <span className="text-[9px] font-semibold text-slate-500 tabular">{format(new Date(row.at), 'HH:mm')} UTC</span>
                </span>
              )
            },
            {
              key: 'action',
              label: 'Action',
              render: (row) => (
                <span className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-bold ${ACTION_TONES[row.action] || 'bg-slate-100 text-slate-600'}`}>
                  {row.action}
                </span>
              )
            },
            { key: 'target', label: 'Target', render: (row) => <span className="font-bold text-deepNavy">{row.target}</span> },
            { key: 'detail', label: 'Detail' },
            { key: 'actor', label: 'Actor', render: (row) => <span className="text-[10px] font-semibold text-slate-500">{row.actor}</span> }
          ]}
          rows={rows}
          keyField="id"
          empty="No events match these filters."
          footer="Events are append-only and cannot be edited by any role."
        />
      </SectionCard>
    </div>
  );
};

export default ITAuditTab;
