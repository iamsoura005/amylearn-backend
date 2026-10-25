import { useMemo, useState } from 'react';
import { BellRing, IndianRupee, Receipt, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { SectionCard, FilterChips, inr } from '@/components/portal/PortalKit';
import { Progress } from '@/components/ui/Primitives';
import {
  MOCK_FEE_STRUCTURES,
  MOCK_FEE_COLLECTIONS,
  MOCK_FEE_DEFAULTERS
} from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const VIEW_FILTERS = [
  { id: 'collections', label: 'Collections' },
  { id: 'structures', label: 'Fee structures' },
  { id: 'defaulters', label: 'Defaulters' }
];

const AdminFeesTab = ({ triggerPopup }) => {
  const [view, setView] = useState('collections');
  const [reminding, setReminding] = useState(false);

  const totalCollected = MOCK_FEE_COLLECTIONS.reduce((sum, row) => sum + row.collected, 0);
  const totalPending = MOCK_FEE_COLLECTIONS.reduce((sum, row) => sum + row.pending, 0);

  const remindAll = () => {
    setReminding(true);
    window.setTimeout(() => {
      setReminding(false);
      triggerPopup('Reminder emails sent to all defaulters. A second notice is queued for next week.', 'success');
    }, 700);
  };

  const defaulters = useMemo(() => MOCK_FEE_DEFAULTERS, []);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academics · Finance"
        title="Fees & payments"
        description="Term fee collections, structures and defaulters across departments."
        icon={IndianRupee}
        tone="teal"
        actions={
          view === 'defaulters' ? (
            <button
              onClick={remindAll}
              disabled={reminding}
              className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2.5 text-[11px] font-bold text-white hover:bg-amber-700 disabled:opacity-50"
            >
              <BellRing size={13} /> {reminding ? 'Sending…' : 'Remind all defaulters'}
            </button>
          ) : null
        }
      />

      <FilterChips options={VIEW_FILTERS} value={view} onChange={setView} tone="teal" />

      {view === 'collections' ? (
        <>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Collected</p>
              <p className="mt-1 text-xl font-extrabold text-emerald-700 font-jost tabular">{inr(totalCollected)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Pending</p>
              <p className="mt-1 text-xl font-extrabold text-amber-700 font-jost tabular">{inr(totalPending)}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Defaulters</p>
              <p className="mt-1 text-xl font-extrabold text-deepNavy font-jost tabular">{MOCK_FEE_DEFAULTERS.length}</p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Collection rate</p>
              <p className="mt-1 text-xl font-extrabold text-teal-700 font-jost tabular">94.6%</p>
            </div>
          </div>

          <SectionCard title="By department" description="Current term collections" icon={TrendingUp} tone="teal">
            <DataTable
              columns={[
                { key: 'department', label: 'Department', render: (row) => <span className="font-bold text-deepNavy">{row.department}</span> },
                { key: 'semester', label: 'Batch' },
                { key: 'total', label: 'Billed', render: (row) => <span className="tabular">{inr(row.total)}</span> },
                { key: 'collected', label: 'Collected', render: (row) => <span className="font-semibold text-emerald-700 tabular">{inr(row.collected)}</span> },
                { key: 'pending', label: 'Pending', render: (row) => <span className="font-semibold text-amber-700 tabular">{inr(row.pending)}</span> },
                { key: 'defaulters', label: 'Defaulters', render: (row) => <span className="tabular">{row.defaulters}</span> },
                {
                  key: 'percent',
                  label: 'Progress',
                  render: (row) => (
                    <span className="flex items-center gap-2">
                      <Progress value={row.percent} thickness="h-1" className="w-16" tone="teal" />
                      <span className="text-[10px] font-bold text-deepNavy tabular">{row.percent}%</span>
                    </span>
                  )
                }
              ]}
              rows={MOCK_FEE_COLLECTIONS}
              keyField="id"
            />
          </SectionCard>
        </>
      ) : null}

      {view === 'structures' ? (
        <SectionCard title="Fee structures" description="Term-wise component breakdown" icon={Receipt} tone="teal">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {MOCK_FEE_STRUCTURES.map((structure) => (
              <div key={structure.id} className="rounded-2xl border border-slate-200/80 p-3.5 shadow-2xs">
                <p className="text-[11px] font-extrabold text-deepNavy font-jost">{structure.stream}</p>
                <p className="text-[9px] font-semibold text-slate-500">Semester {structure.semester}</p>
                <div className="mt-3 space-y-1.5">
                  {[
                    { label: 'Tuition', value: structure.tuition },
                    { label: 'Lab', value: structure.lab },
                    { label: 'Library', value: structure.library },
                    { label: 'Exam', value: structure.exam },
                    { label: 'Misc', value: structure.misc }
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-500">{item.label}</span>
                      <span className="font-bold text-deepNavy tabular">{inr(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Total</span>
                  <span className="text-sm font-extrabold text-teal-700 font-jost tabular">{inr(structure.total)}</span>
                </div>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : null}

      {view === 'defaulters' ? (
        <SectionCard title="Defaulter list" description="Students with overdue term fees" icon={BellRing} tone="amber">
          <DataTable
            columns={[
              { key: 'rollNumber', label: 'Roll number', render: (row) => <span className="font-bold text-deepNavy">{row.rollNumber}</span> },
              { key: 'name', label: 'Student' },
              { key: 'department', label: 'Department' },
              { key: 'semester', label: 'Sem', render: (row) => <span className="tabular">{row.semester}</span> },
              { key: 'due', label: 'Due', render: (row) => <span className="font-bold text-rose-600 tabular">{inr(row.due)}</span> },
              { key: 'daysOverdue', label: 'Overdue', render: (row) => <span className="tabular">{row.daysOverdue} days</span> },
              {
                key: 'noticesSent',
                label: 'Reminders',
                render: (row) => (
                  <span className={`rounded-full px-1.5 py-0.5 text-[8px] font-bold ${row.noticesSent >= 2 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
                    {row.noticesSent} sent
                  </span>
                )
              },
              {
                key: 'actions',
                label: '',
                sortable: false,
                render: (row) => (
                  <button
                    onClick={() => triggerPopup(`Payment reminder emailed to ${row.name}.`, 'success')}
                    className="rounded-lg border border-amber-200 px-2.5 py-1.5 text-[9px] font-bold text-amber-700 hover:bg-amber-50"
                  >
                    Remind
                  </button>
                )
              }
            ]}
            rows={defaulters}
            keyField="id"
            footer={`${defaulters.length} defaulters · students below 75% attendance are flagged separately in the COE queue`}
          />
        </SectionCard>
      ) : null}
    </div>
  );
};

export default AdminFeesTab;
