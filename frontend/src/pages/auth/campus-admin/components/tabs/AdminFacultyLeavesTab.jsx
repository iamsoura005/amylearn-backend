import { useMemo, useState } from 'react';
import { CalendarDays, Check, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips, formatDay } from '@/components/portal/PortalKit';
import { MOCK_LEAVE_REQUESTS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const STATUS_FILTERS = [
  { id: 'pending', label: 'Pending', count: MOCK_LEAVE_REQUESTS.filter((leave) => leave.status === 'pending').length },
  { id: 'approved', label: 'Approved', count: MOCK_LEAVE_REQUESTS.filter((leave) => leave.status === 'approved').length },
  { id: 'rejected', label: 'Rejected', count: MOCK_LEAVE_REQUESTS.filter((leave) => leave.status === 'rejected').length },
  { id: 'all', label: 'All' }
];

const AdminFacultyLeavesTab = ({ triggerPopup }) => {
  const [status, setStatus] = useState('pending');
  const [leaves, setLeaves] = useState(MOCK_LEAVE_REQUESTS);
  const [viewing, setViewing] = useState(null);

  const rows = useMemo(
    () => (status === 'all' ? leaves : leaves.filter((leave) => leave.status === status)),
    [leaves, status]
  );

  const decide = (decision) => {
    if (!viewing) return;
    setLeaves((current) =>
      current.map((leave) => (leave.id === viewing.id ? { ...leave, status: decision } : leave))
    );
    triggerPopup(
      decision === 'approved'
        ? `${viewing.faculty}'s leave (${viewing.from} → ${viewing.to}) approved.`
        : `${viewing.faculty}'s leave request rejected.`,
      decision === 'approved' ? 'success' : 'error'
    );
    setViewing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="People"
        title="Faculty leaves"
        description="Review and approve faculty leave requests. Approved leaves update the timetable availability."
        icon={CalendarDays}
        tone="teal"
      />

      <SectionCard title="Leave requests" description="Click a row to review the full request" icon={CalendarDays} tone="teal">
        <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} tone="teal" />
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'faculty', label: 'Faculty', render: (row) => <span className="font-bold text-deepNavy">{row.faculty}</span> },
              { key: 'department', label: 'Department' },
              {
                key: 'type',
                label: 'Type',
                render: (row) => (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${
                    row.type === 'Conference' ? 'bg-violet-50 text-violet-700' : row.type === 'Medical' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {row.type}
                  </span>
                )
              },
              { key: 'from', label: 'From', render: (row) => <span className="tabular">{formatDay(row.from)}</span> },
              { key: 'to', label: 'To', render: (row) => <span className="tabular">{formatDay(row.to)}</span> },
              { key: 'days', label: 'Days', render: (row) => <span className="tabular">{row.days}</span> },
              { key: 'applied', label: 'Applied', render: (row) => <span className="tabular">{formatDay(row.applied)}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            rows={rows}
            keyField="id"
            onRowClick={setViewing}
            empty="No leave requests in this state."
          />
        </div>
      </SectionCard>

      <Modal
        open={Boolean(viewing)}
        onClose={() => setViewing(null)}
        title={viewing?.faculty || ''}
        description={`${viewing?.department} · ${viewing?.type} leave`}
        tone="teal"
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
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: 'From', value: formatDay(viewing.from) },
                { label: 'To', value: formatDay(viewing.to) },
                { label: 'Days', value: viewing.days },
                { label: 'Applied on', value: formatDay(viewing.applied) }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy tabular">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Reason</p>
              <p className="mt-1 text-[11px] font-semibold leading-relaxed text-deepNavy">{viewing.reason}</p>
            </div>
            {viewing.status !== 'pending' ? (
              <div className={`rounded-xl border p-3 text-[10px] font-semibold ${viewing.status === 'approved' ? 'border-emerald-100 bg-emerald-50/60 text-emerald-700' : 'border-rose-100 bg-rose-50/60 text-rose-700'}`}>
                This request was {viewing.status}. The decision has been shared with the faculty member.
              </div>
            ) : null}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminFacultyLeavesTab;
