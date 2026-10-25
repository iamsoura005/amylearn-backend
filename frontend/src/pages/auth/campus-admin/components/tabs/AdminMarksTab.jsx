import { useMemo, useState } from 'react';
import { FileSpreadsheet, Lock, Unlock, Save } from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { DataTable } from '@/components/common/DataTable';
import { Modal } from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { SectionCard, FilterChips, FormField, inputClass, formatDay } from '@/components/portal/PortalKit';
import { MOCK_MARKS_BATCHES, MOCK_MARKS_ENTRIES } from '@/pages/auth/campus-admin/constants/campusAdminConstants';

const AdminMarksTab = ({ triggerPopup }) => {
  const [batchId, setBatchId] = useState('ia2-cse5');
  const [batches, setBatches] = useState(MOCK_MARKS_BATCHES);
  const [entries, setEntries] = useState(MOCK_MARKS_ENTRIES);
  const [editing, setEditing] = useState(null);

  const batch = batches.find((item) => item.id === batchId) || batches[0];

  const rows = useMemo(() => {
    if (batchId === 'ia2-cse5') return entries;
    return entries.slice(0, batchId === 'ia2-ai5' ? 0 : 0);
  }, [batchId, entries]);

  const lockBatch = () => {
    setBatches((current) =>
      current.map((item) => (item.id === batchId ? { ...item, status: item.status === 'locked' ? 'in-progress' : 'locked' } : item))
    );
    triggerPopup(
      batch.status === 'locked'
        ? `${batch.label} unlocked for corrections.`
        : `${batch.label} locked. Marks can no longer be edited by faculty.`,
      'success'
    );
  };

  const saveMarks = (event) => {
    event.preventDefault();
    if (!editing) return;
    const obtained = Number(editing.obtained);
    if (Number.isNaN(obtained) || obtained < 0 || obtained > editing.maxMarks) {
      triggerPopup(`Marks must be between 0 and ${editing.maxMarks}.`, 'error');
      return;
    }
    setEntries((current) =>
      current.map((entry) =>
        entry.id === editing.id ? { ...entry, obtained } : entry
      )
    );
    triggerPopup(`${editing.name} · ${editing.subject} updated to ${obtained}/${editing.maxMarks}.`, 'success');
    setEditing(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Academics"
        title="Marks entry"
        description="Monitor internal assessment batches, correct entries and lock batches after verification."
        icon={FileSpreadsheet}
        tone="teal"
        actions={
          <button
            onClick={lockBatch}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] font-bold ${
              batch.status === 'locked'
                ? 'border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                : 'bg-teal-700 text-white hover:bg-teal-800'
            }`}
          >
            {batch.status === 'locked' ? <><Unlock size={13} /> Unlock batch</> : <><Lock size={13} /> Lock batch</>}
          </button>
        }
      />

      <FilterChips
        options={batches.map((item) => ({ id: item.id, label: item.label }))}
        value={batchId}
        onChange={setBatchId}
        tone="teal"
      />

      <div className="grid gap-3 lg:grid-cols-3">
        <SectionCard title="Batch status" description={batch.label} icon={FileSpreadsheet} tone="teal">
          <div className="space-y-2">
            {[
              { label: 'Status', value: <StatusBadge status={batch.status} /> },
              { label: 'Entries done', value: batch.entered },
              { label: 'Deadline', value: formatDay(batch.deadline) },
              { label: 'Exam', value: batch.exam }
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-2.5 py-2">
                <span className="text-[10px] font-semibold text-slate-500">{item.label}</span>
                <span className="text-[10px] font-bold text-deepNavy">{item.value}</span>
              </div>
            ))}
            <p className="rounded-xl border border-amber-100 bg-amber-50/50 p-2.5 text-[9px] font-semibold leading-snug text-amber-700">
              Locked batches feed into result calculation. Unlocking re-opens the entry window for faculty.
            </p>
          </div>
        </SectionCard>

        <SectionCard title="Recent entries" description="Latest marks recorded by faculty" icon={FileSpreadsheet} tone="blue" className="lg:col-span-2">
          <DataTable
            columns={[
              { key: 'rollNumber', label: 'Roll number', render: (row) => <span className="font-bold text-deepNavy">{row.rollNumber}</span> },
              { key: 'name', label: 'Student' },
              {
                key: 'subject',
                label: 'Subject',
                render: (row) => <span className="text-[10px] font-semibold text-slate-500">{row.subject}</span>
              },
              { key: 'maxMarks', label: 'Max', render: (row) => <span className="tabular">{row.maxMarks}</span> },
              {
                key: 'obtained',
                label: 'Obtained',
                render: (row) => (
                  <span className={`font-bold tabular ${row.obtained / row.maxMarks >= 0.9 ? 'text-emerald-700' : row.obtained / row.maxMarks >= 0.4 ? 'text-deepNavy' : 'text-rose-600'}`}>
                    {row.obtained}
                  </span>
                )
              },
              {
                key: 'actions',
                label: '',
                sortable: false,
                render: (row) =>
                  batch.status === 'locked' ? null : (
                    <button
                      onClick={() => setEditing(row)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[9px] font-bold text-slate-600 hover:border-teal-300 hover:text-teal-700"
                    >
                      Edit
                    </button>
                  )
              }
            ]}
            rows={rows}
            keyField="id"
            footer={`${rows.length} entries · marks beyond 90% and below 40% are highlighted`}
          />
        </SectionCard>
      </div>

      <Modal
        open={Boolean(editing)}
        onClose={() => setEditing(null)}
        title={editing?.name || ''}
        description={`${editing?.rollNumber} · ${editing?.subject}`}
        tone="teal"
        footer={
          <button
            onClick={saveMarks}
            className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-[11px] font-bold text-white hover:bg-teal-800"
          >
            <Save size={13} /> Save marks
          </button>
        }
      >
        {editing ? (
          <form onSubmit={saveMarks} className="space-y-3">
            <FormField label={`Obtained marks (max ${editing.maxMarks})`}>
              <input
                value={editing.obtained}
                onChange={(event) => setEditing({ ...editing, obtained: event.target.value })}
                type="number"
                min={0}
                max={editing.maxMarks}
                className={inputClass}
              />
            </FormField>
          </form>
        ) : null}
      </Modal>
    </div>
  );
};

export default AdminMarksTab;
