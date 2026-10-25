import { useMemo, useState } from 'react';
import { CheckCircle2, LifeBuoy, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips } from '@/components/portal/PortalKit';
import { MOCK_SUPPORT_REQUESTS } from '@/pages/auth/it-admin/constants/itAdminConstants';

const STATUS_FILTERS = [
  { id: 'open', label: 'Open', count: MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'open').length },
  { id: 'in-progress', label: 'In progress', count: MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'in-progress').length },
  { id: 'resolved', label: 'Resolved', count: MOCK_SUPPORT_REQUESTS.filter((ticket) => ticket.status === 'resolved').length },
  { id: 'all', label: 'All' }
];

const PRIORITY_TONES = {
  high: 'bg-rose-50 text-rose-700',
  medium: 'bg-amber-50 text-amber-700',
  low: 'bg-slate-100 text-slate-600'
};

const ITRequestsTab = ({ triggerPopup }) => {
  const [status, setStatus] = useState('open');
  const [tickets, setTickets] = useState(MOCK_SUPPORT_REQUESTS);
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(
    () => (status === 'all' ? tickets : tickets.filter((ticket) => ticket.status === status)),
    [tickets, status]
  );

  const advance = () => {
    if (!viewing) return;
    const next = viewing.status === 'open' ? 'in-progress' : 'resolved';
    setTickets((current) => current.map((ticket) => (ticket.id === viewing.id ? { ...ticket, status: next } : ticket)));
    triggerPopup(
      next === 'in-progress' ? `Ticket ${viewing.id} picked up for investigation.` : `Ticket ${viewing.id} resolved. The campus admin has been notified.`,
      'success'
    );
    setViewing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Support"
        title="Support requests"
        description="Issues raised by campus admins across all tenants."
        icon={LifeBuoy}
        tone="blue"
      />

      <div className="grid grid-cols-3 gap-3">
        {STATUS_FILTERS.filter((filter) => filter.id !== 'all').map((filter) => (
          <button
            key={filter.id}
            onClick={() => setStatus(filter.id)}
            className={`rounded-2xl border p-3.5 text-left shadow-2xs transition-colors ${
              status === filter.id ? 'border-blue-300 bg-blue-50/50' : 'border-slate-200/80 bg-white hover:border-blue-200'
            }`}
          >
            <p className="text-lg font-extrabold text-deepNavy font-jost tabular">{filter.count}</p>
            <p className="text-[10px] font-bold text-slate-500">{filter.label}</p>
          </button>
        ))}
      </div>

      <SectionCard title="Ticket queue" description="Click a ticket to review and act" icon={LifeBuoy} tone="blue">
        <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} tone="blue" />
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'id', label: 'ID', render: (row) => <span className="font-mono text-[10px] font-bold text-deepNavy">{row.id}</span> },
              { key: 'title', label: 'Issue', render: (row) => <span className="font-bold text-deepNavy">{row.title}</span> },
              {
                key: 'campus',
                label: 'Campus',
                render: (row) => <span className="grid h-6 w-12 place-items-center rounded-md bg-blue-50 text-[10px] font-bold text-brandBlue">{row.campus}</span>
              },
              { key: 'raisedBy', label: 'Raised by' },
              { key: 'category', label: 'Category' },
              {
                key: 'priority',
                label: 'Priority',
                render: (row) => <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${PRIORITY_TONES[row.priority]}`}>{row.priority}</span>
              },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> },
              { key: 'created', label: 'Created' }
            ]}
            rows={rows}
            keyField="id"
            onRowClick={setViewing}
            empty="No tickets in this state."
          />
        </div>
      </SectionCard>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || ''}
        description={`${viewing?.id} · ${viewing?.campus} · raised by ${viewing?.raisedBy}`}
        tone="blue"
        footer={
          viewing && viewing.status !== 'resolved' ? (
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => {
                  triggerPopup('Reply sent to the campus admin from the support queue.', 'info');
                  setViewing(null);
                }}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <MessageSquare size={13} /> Reply
              </button>
              <button
                onClick={advance}
                className="inline-flex items-center gap-1 rounded-xl bg-brandBlue px-3.5 py-2 text-[11px] font-bold text-white hover:bg-brand-700"
              >
                <CheckCircle2 size={13} /> {viewing.status === 'open' ? 'Start investigation' : 'Mark resolved'}
              </button>
            </div>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'Priority', value: viewing.priority },
                { label: 'Category', value: viewing.category },
                { label: 'Created', value: viewing.created },
                { label: 'Status', value: viewing.status }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-[10.5px] font-bold capitalize text-deepNavy">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Support notes</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-deepNavy">{viewing.notes}</p>
            </div>
            <p className="rounded-xl border border-blue-100 bg-blue-50/50 p-2.5 text-[9px] font-semibold leading-snug text-brandBlue">
              Every status change is logged in the audit trail and shared with the campus admin.
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default ITRequestsTab;
