import { useMemo, useState, useEffect } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Filter,
  Search,
  Send,
  AlertTriangle,
  Upload
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { FileDropzone } from '@/components/common/FileDropzone';
import { SectionCard, SoftStat, dueLabel, daysUntil, formatDay } from './shared/StudentTabKit';
import { MOCK_ASSIGNMENTS } from '@/pages/auth/campus-student/constants/campusStudentConstants';
import api from '@/utils/config';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Pending', label: 'Pending' },
  { id: 'Submitted', label: 'Submitted' },
  { id: 'Graded', label: 'Graded' }
];

export const StudentAssignmentsTab = ({ triggerPopup }) => {
  const [items, setItems] = useState(MOCK_ASSIGNMENTS);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(null);
  const [files, setFiles] = useState([]);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const loadAssignments = async () => {
      setLoading(true);
      try {
        const res = await api.get('/api/assignments');
        if (active && res.data?.assignments?.length) {
          setItems(res.data.assignments);
        }
      } catch (err) {
        // Keeps fallback
      } finally {
        if (active) setLoading(false);
      }
    };
    loadAssignments();
    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesQuery = !value || item.title.toLowerCase().includes(value) || item.course.toLowerCase().includes(value) || item.code.toLowerCase().includes(value);
      return (filter === 'all' || item.status === filter) && matchesQuery;
    });
  }, [items, filter, query]);

  const pending = items.filter((item) => item.status === 'Pending');
  const graded = items.filter((item) => item.status === 'Graded');
  const average = graded.length ? Math.round(graded.reduce((sum, item) => sum + (item.marks / item.total) * 100, 0) / graded.length) : 0;

  const submit = async () => {
    if (!files.length) {
      triggerPopup?.('Attach at least one file before submitting this assignment.', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const fileNames = files.map((f) => (typeof f === 'string' ? f : f.name || 'assignment_submission.pdf'));
      const res = await api.post(`/api/assignments/${selected.id}/submit`, {
        files: fileNames,
        note
      });
      if (res.data?.success) {
        setItems((prev) =>
          prev.map((item) =>
            item.id === selected.id
              ? { ...item, status: 'Submitted', files: fileNames, note, submittedAt: new Date().toISOString() }
              : item
          )
        );
        triggerPopup?.(res.data.message || `“${selected.title}” submitted successfully.`, 'success');
        setSelected(null);
        setFiles([]);
        setNote('');
      }
    } catch (err) {
      triggerPopup?.(err?.response?.data?.message || 'Failed to submit assignment. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Learning management"
        title="Assignments"
        description="Submission windows, grading status and faculty remarks for all six courses."
        icon={ClipboardList}
        tone="indigo"
        actions={<Badge tone="amber">{pending.length} pending</Badge>}
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Pending" value={pending.length} hint="Needs submission" icon={Clock} tone="amber" />
        <SoftStat label="Submitted" value={items.filter((item) => item.status === 'Submitted').length} hint="Awaiting evaluation" icon={Send} tone="indigo" />
        <SoftStat label="Graded" value={graded.length} hint="Marks published" icon={CheckCircle2} tone="emerald" />
        <SoftStat label="Average score" value={`${average}%`} hint="Across graded work" icon={ClipboardList} tone="violet" />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={query} onChange={setQuery} placeholder="Search assignment or course…" className="w-full sm:max-w-xs" tone="indigo" />
        <div className="flex flex-wrap items-center gap-1">
          <Filter size={12} className="mr-0.5 text-slate-400" />
          {FILTERS.map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
                filter === item.id ? 'bg-indigo-600 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
              }`}
            >
              {item.label}
              <span className="ml-1 opacity-70">
                {item.id === 'all' ? items.length : items.filter((row) => row.status === item.id).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2.5 xl:grid-cols-2">
        {filtered.map((assignment) => {
          const days = daysUntil(assignment.due);
          const overdue = assignment.status === 'Pending' && days !== null && days < 0;
          const urgent = assignment.status === 'Pending' && days !== null && days >= 0 && days <= 3;
          return (
            <SectionCard key={assignment.id} bodyClassName="p-3.5" className={overdue ? 'border-rose-200' : ''}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="rounded-md bg-indigo-50 px-1.5 py-0.5 text-[8.5px] font-extrabold text-indigo-700">{assignment.code}</span>
                    <span className="text-[8.5px] font-bold uppercase tracking-wide text-slate-500">{assignment.type}</span>
                  </div>
                  <h3 className="mt-1.5 text-[13px] font-extrabold leading-snug text-deepNavy font-jost">{assignment.title}</h3>
                  <p className="mt-0.5 text-[9.5px] font-semibold text-slate-500">{assignment.course} · {assignment.faculty}</p>
                </div>
                <StatusBadge status={assignment.status} />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 px-2.5 py-2">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Due</p>
                  <p className="mt-0.5 text-[10px] font-bold text-deepNavy">{formatDay(assignment.due)}</p>
                </div>
                <div className={`rounded-xl px-2.5 py-2 ${overdue ? 'bg-rose-50' : urgent ? 'bg-amber-50' : 'bg-slate-50'}`}>
                  <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Window</p>
                  <p className={`mt-0.5 text-[10px] font-bold ${overdue ? 'text-rose-700' : urgent ? 'text-amber-700' : 'text-slate-500'}`}>
                    {assignment.status === 'Pending' ? dueLabel(assignment.due) : assignment.status === 'Graded' ? 'Graded' : 'Submitted'}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-2.5">
                <span className="text-[10px] font-semibold text-slate-500">
                  {assignment.marks !== null ? (
                    <span className="font-extrabold text-emerald-700">{assignment.marks}/{assignment.total} marks</span>
                  ) : (
                    <>Max marks <span className="font-bold text-deepNavy">{assignment.total}</span></>
                  )}
                </span>
                {assignment.status === 'Pending' ? (
                  <Button
                    size="xs"
                    icon={Upload}
                    onClick={() => {
                      setSelected(assignment);
                      setFiles([]);
                      setNote('');
                    }}
                  >
                    Submit work
                  </Button>
                ) : (
                  <Button size="xs" variant="secondary" icon={FileText} onClick={() => setSelected(assignment)}>
                    View details
                  </Button>
                )}
              </div>
            </SectionCard>
          );
        })}
      </div>

      {!filtered.length ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
          <Search size={20} className="mx-auto text-slate-300" />
          <p className="mt-2 text-sm font-bold text-deepNavy font-jost">Nothing matches this filter</p>
          <p className="mt-1 text-xs text-slate-500">Try another status or clear the search.</p>
        </div>
      ) : null}

      <Modal
        open={Boolean(selected)}
        onClose={() => {
          setSelected(null);
          setFiles([]);
        }}
        title={selected?.title || 'Assignment'}
        description={selected ? `${selected.code} · ${selected.course} · ${selected.faculty}` : undefined}
        size="md"
        footer={
          selected ? (
            selected.status === 'Pending' ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                  Cancel
                </Button>
                <Button size="sm" icon={Send} loading={submitting} onClick={submit}>
                  Submit assignment
                </Button>
              </>
            ) : (
              <Button variant="secondary" size="sm" onClick={() => setSelected(null)}>
                Close
              </Button>
            )
          ) : null
        }
      >
        {selected ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Due date</p>
                <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy">{formatDay(selected.due)}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Type</p>
                <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy">{selected.type}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-2.5">
                <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Status</p>
                <p className="mt-0.5 text-[10.5px] font-bold text-deepNavy">{selected.status}</p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-100 p-3">
              <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">What to submit</p>
              <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                Upload your report as a single PDF (max 25 MB). Include your roll number and name on the first page. Code
                submissions should include a README with run instructions.
              </p>
            </div>

            {selected.status === 'Pending' ? (
              <>
                {daysUntil(selected.due) !== null && daysUntil(selected.due) < 0 ? (
                  <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5">
                    <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-600" />
                    <p className="text-[10px] font-semibold text-rose-700">
                      The submission window has closed. Your file will be marked as a late submission for faculty review.
                    </p>
                  </div>
                ) : null}
                <FileDropzone
                  multiple={false}
                  label="Drop your submission here"
                  hint="PDF, DOCX, ZIP or images · max 25 MB"
                  onFiles={setFiles}
                  tone="indigo"
                />
                <label className="block">
                  <span className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Note for faculty (optional)</span>
                  <textarea
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    rows={3}
                    placeholder="Anything your faculty should know about this submission…"
                    className="mt-1 w-full resize-none rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-[11px] text-deepNavy placeholder:text-slate-500 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </label>
              </>
            ) : (
              <div className="rounded-xl border border-slate-100 p-3">
                <p className="text-[9px] font-bold uppercase tracking-wide text-slate-500">Submission</p>
                <div className="mt-1.5 flex items-center gap-2">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                    <FileText size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-bold text-deepNavy">
                      {selected.status === 'Graded' ? `${selected.title.replace(/\s+/g, '-').toLowerCase()}.pdf` : 'submitted-work.pdf'}
                    </p>
                    <p className="text-[9px] font-semibold text-slate-500">
                      {selected.status === 'Graded'
                        ? `Graded · ${selected.marks}/${selected.total} marks`
                        : 'Submitted · awaiting evaluation'}
                    </p>
                  </div>
                  <CalendarClock size={13} className="text-slate-300" />
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default StudentAssignmentsTab;
