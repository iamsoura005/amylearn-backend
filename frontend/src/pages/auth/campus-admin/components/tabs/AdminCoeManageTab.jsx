import { useMemo, useState } from 'react';
import { BadgeCheck, Check, ClipboardCheck, ShieldCheck, X } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips, inr } from '@/components/portal/PortalKit';
import { MOCK_EXAM_FORMS, MOCK_EXAM_SESSIONS } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const STATUS_FILTERS = [
  { id: 'pending', label: 'Pending', count: MOCK_EXAM_FORMS.filter((form) => form.status === 'pending').length },
  { id: 'verified', label: 'Verified', count: MOCK_EXAM_FORMS.filter((form) => form.status === 'verified').length },
  { id: 'approved', label: 'Approved', count: MOCK_EXAM_FORMS.filter((form) => form.status === 'approved').length },
  { id: 'rejected', label: 'Rejected', count: MOCK_EXAM_FORMS.filter((form) => form.status === 'rejected').length },
  { id: 'all', label: 'All' }
];

const AdminCoeManageTab = ({ triggerPopup }) => {
  const [status, setStatus] = useState('pending');
  const [reviewing, setReviewing] = useState(null);
  const [forms, setForms] = useState(MOCK_EXAM_FORMS);

  const rows = useMemo(
    () => (status === 'all' ? forms : forms.filter((form) => form.status === status)),
    [forms, status]
  );

  const decide = (decision) => {
    if (!reviewing) return;
    setForms((current) =>
      current.map((form) =>
        form.id === reviewing.id
          ? { ...form, status: decision, ...(decision === 'rejected' ? { reason: 'Attendance below eligibility threshold' } : {}) }
          : form
      )
    );
    triggerPopup(
      decision === 'approved'
        ? `${reviewing.name}'s exam form approved. Admit card will be generated.`
        : decision === 'rejected'
          ? `${reviewing.name}'s exam form rejected — student has been notified.`
          : `${reviewing.name}'s form marked as verified.`,
      decision === 'rejected' ? 'error' : 'success'
    );
    setReviewing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Examinations · Controller of Examinations"
        title="Exam forms"
        description={`${MOCK_EXAM_SESSIONS[0].name} — verify eligibility and approve student exam forms.`}
        icon={ClipboardCheck}
        tone="amber"
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Pending review', value: forms.filter((form) => form.status === 'pending').length, tone: 'amber' },
          { label: 'Verified', value: forms.filter((form) => form.status === 'verified').length, tone: 'blue' },
          { label: 'Approved', value: forms.filter((form) => form.status === 'approved').length, tone: 'emerald' },
          { label: 'Total received', value: forms.length, tone: 'teal' }
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs`}>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{stat.label}</p>
            <p className="mt-1 text-xl font-extrabold text-deepNavy font-jost tabular">{stat.value}</p>
          </div>
        ))}
      </div>

      <SectionCard
        title="Verification queue"
        description="Click a row to review attendance, fee status and subjects"
        icon={ShieldCheck}
        tone="amber"
      >
        <FilterChips options={STATUS_FILTERS} value={status} onChange={setStatus} tone="teal" />
        <div className="mt-3">
          <DataTable
            columns={[
              { key: 'rollNumber', label: 'Roll number', render: (row) => <span className="font-bold text-deepNavy">{row.rollNumber}</span> },
              { key: 'name', label: 'Student' },
              { key: 'department', label: 'Department' },
              { key: 'semester', label: 'Sem', render: (row) => <span className="tabular">{row.semester}</span> },
              {
                key: 'type',
                label: 'Form',
                render: (row) => (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${row.type === 'Backlog' ? 'bg-orange-50 text-orange-700' : 'bg-slate-100 text-slate-600'}`}>
                    {row.type}
                  </span>
                )
              },
              { key: 'subjects', label: 'Subjects', render: (row) => <span className="tabular">{row.subjects}</span> },
              { key: 'fee', label: 'Fee', render: (row) => <span className="font-semibold tabular">{inr(row.fee)}</span> },
              { key: 'status', label: 'Status', render: (row) => <StatusBadge status={row.status} /> }
            ]}
            rows={rows}
            keyField="id"
            onRowClick={setReviewing}
            empty="No forms in this state."
            footer={`${rows.length} form(s) · form deadline ${new Date(MOCK_EXAM_SESSIONS[0].formDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
          />
        </div>
      </SectionCard>

      <Modal
        open={Boolean(reviewing)}
        onClose={() => setReviewing(null)}
        title={reviewing?.name || ''}
        description={`${reviewing?.rollNumber} · ${reviewing?.department} Sem ${reviewing?.semester}`}
        tone="amber"
        footer={
          reviewing ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => decide('rejected')}
                className="inline-flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-[11px] font-bold text-rose-600 hover:bg-rose-100"
              >
                <X size={13} /> Reject
              </button>
              <button
                onClick={() => decide('verified')}
                className="inline-flex items-center gap-1 rounded-xl border border-slate-200 px-3.5 py-2 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
              >
                <Check size={13} /> Mark verified
              </button>
              <button
                onClick={() => decide('approved')}
                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 text-[11px] font-bold text-white hover:bg-emerald-700"
              >
                <BadgeCheck size={13} /> Approve
              </button>
            </div>
          ) : null
        }
      >
        {reviewing ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {[
                { label: 'Form type', value: reviewing.type },
                { label: 'Subjects', value: reviewing.subjects },
                { label: 'Fee', value: inr(reviewing.fee) },
                { label: 'Fee status', value: reviewing.fee > 0 ? 'Paid' : 'Waived' },
                { label: 'Attendance', value: reviewing.rollNumber === 'NBR2024CE031' ? '68% · below 75%' : 'Above 75%' },
                { label: 'Submitted', value: reviewing.submitted }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-100 p-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{item.label}</p>
                  <p className={`mt-0.5 text-[10.5px] font-bold ${String(item.value).includes('below') ? 'text-rose-600' : 'text-deepNavy'}`}>{item.value}</p>
                </div>
              ))}
            </div>
            {reviewing.reason ? (
              <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-3 text-[10px] font-semibold text-rose-700">
                Rejection reason: {reviewing.reason}
              </div>
            ) : null}
            <div className="rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-[10px] font-semibold leading-snug text-amber-700">
              Approving generates the QR admit card. Rejecting notifies the student with the recorded reason.
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminCoeManageTab;
