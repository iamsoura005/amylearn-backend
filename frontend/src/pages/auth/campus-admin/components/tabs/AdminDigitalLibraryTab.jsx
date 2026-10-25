import { useMemo, useState } from 'react';
import { BookOpen, Check, KeyRound, Library, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips, formatDay } from '@/components/portal/PortalKit';
import { MOCK_LIBRARY_APPROVALS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const KIND_FILTERS = [
  { id: 'pending', label: 'Pending', count: MOCK_LIBRARY_APPROVALS.filter((item) => item.status === 'pending').length },
  { id: 'approved', label: 'Approved', count: MOCK_LIBRARY_APPROVALS.filter((item) => item.status === 'approved').length },
  { id: 'rejected', label: 'Rejected', count: MOCK_LIBRARY_APPROVALS.filter((item) => item.status === 'rejected').length },
  { id: 'all', label: 'All' }
];

const STAT_TONES = {
  amber: 'bg-amber-50 text-amber-700',
  teal: 'bg-teal-50 text-teal-700',
  violet: 'bg-violet-50 text-violet-700',
  blue: 'bg-blue-50 text-blue-700'
};

const AdminDigitalLibraryTab = ({ triggerPopup }) => {
  const [status, setStatus] = useState('pending');
  const [requests, setRequests] = useState(MOCK_LIBRARY_APPROVALS);
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(
    () => (status === 'all' ? requests : requests.filter((request) => request.status === status)),
    [requests, status]
  );

  const decide = (decision) => {
    if (!viewing) return;
    setRequests((current) =>
      current.map((request) => (request.id === viewing.id ? { ...request, status: decision } : request))
    );
    triggerPopup(
      decision === 'approved'
        ? `“${viewing.title}” approved. Requester has been notified.`
        : `“${viewing.title}” rejected.`,
      decision === 'approved' ? 'success' : 'error'
    );
    setViewing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Resources"
        title="Digital library"
        description="Approve physical loans, digital vault requests and subscription access."
        icon={Library}
        tone="teal"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending approvals', value: requests.filter((request) => request.status === 'pending').length, icon: KeyRound, tone: 'amber' },
          { label: 'Physical loans', value: requests.filter((request) => request.kind === 'physical').length, icon: BookOpen, tone: 'teal' },
          { label: 'Digital requests', value: requests.filter((request) => request.kind === 'digital').length, icon: KeyRound, tone: 'violet' },
          { label: 'Active loans', value: 214, icon: Library, tone: 'blue' }
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
                <span className={`grid h-7 w-7 place-items-center rounded-lg ${STAT_TONES[stat.tone] || STAT_TONES.amber}`}>
                  <Icon size={13} />
                </span>
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-deepNavy font-jost tabular">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <SectionCard
        title="Approval queue"
        description="Click a row to review the request"
        icon={KeyRound}
        tone="amber"
      >
        <FilterChips options={KIND_FILTERS} value={status} onChange={setStatus} tone="teal" />
        <div className="mt-3">
          <DataTable
            columns={[
              {
                key: 'kind',
                label: 'Kind',
                render: (row) => (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${row.kind === 'digital' ? 'bg-violet-50 text-violet-700' : 'bg-teal-50 text-teal-700'}`}>
                    {row.kind === 'digital' ? 'Digital' : 'Physical'}
                  </span>
                )
              },
              { key: 'title', label: 'Request', render: (row) => <span className="font-bold text-deepNavy">{row.title}</span> },
              { key: 'requestedBy', label: 'Requested by' },
              { key: 'department', label: 'Department' },
              { key: 'requested', label: 'Requested', render: (row) => <span className="tabular">{formatDay(row.requested)}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            rows={rows}
            keyField="id"
            onRowClick={setViewing}
            empty="No requests in this state."
          />
        </div>
      </SectionCard>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.title || ''}
        description={`${viewing?.kind === 'digital' ? 'Digital access' : 'Physical loan'} · requested by ${viewing?.requestedBy}`}
        tone="amber"
        footer={
          viewing?.status === 'pending' ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => decide('rejected')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
              >
                <X size={13} /> Reject
              </button>
              <button
                onClick={() => decide('approved')}
                className="inline-flex items-center gap-1 rounded-xl bg-teal-700 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
              >
                <Check size={13} /> Approve
              </button>
            </div>
          ) : null
        }
      >
        {viewing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg border border-slate-100 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Department</p>
                <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy">{viewing.department}</p>
              </div>
              <div className="rounded-lg border border-slate-100 p-2">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Requested on</p>
                <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy tabular">{formatDay(viewing.requested)}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Purpose</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-deepNavy">{viewing.purpose}</p>
            </div>
            {viewing.kind === 'digital' ? (
              <p className="rounded-xl border border-violet-100 bg-violet-50/50 p-2.5 text-[9px] font-semibold leading-snug text-violet-700">
                Approving grants vault access and sends encrypted credentials to the requester's vault.
              </p>
            ) : (
              <p className="rounded-xl border border-teal-100 bg-teal-50/50 p-2.5 text-[9px] font-semibold leading-snug text-teal-700">
                Approving adds the titles to the catalogue. Procurement is notified for purchase.
              </p>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminDigitalLibraryTab;
