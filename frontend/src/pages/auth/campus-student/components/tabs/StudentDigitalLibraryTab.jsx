import { useMemo, useState } from 'react';
import {
  BookMarked,
  BookOpen,
  Download,
  ExternalLink,
  FileText,
  Filter,
  Library,
  RotateCcw,
  Search,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/Primitives';
import { Modal } from '@/components/ui/Modal';
import { PdfViewer } from '@/components/common/VideoPlayer';
import { SectionCard, SoftStat, formatDay, inr } from './shared/StudentTabKit';
import {
  MOCK_DIGITAL_RESOURCES,
  MOCK_LIBRARY_LOANS
} from '@/pages/auth/campus-student/constants/campusStudentConstants';

const TYPES = ['All', 'Notes', 'PYQ', 'Manual', 'Slides', 'Template', 'E-book', 'Reading list'];

export const StudentDigitalLibraryTab = ({ triggerPopup }) => {
  const [view, setView] = useState('digital');
  const [query, setQuery] = useState('');
  const [type, setType] = useState('All');
  const [viewer, setViewer] = useState(null);

  const resources = useMemo(() => {
    const value = query.trim().toLowerCase();
    return MOCK_DIGITAL_RESOURCES.filter((item) => {
      const matchesQuery = !value || item.title.toLowerCase().includes(value) || item.author.toLowerCase().includes(value);
      const matchesType = type === 'All' || item.type === type;
      return matchesQuery && matchesType;
    });
  }, [query, type]);

  const activeLoans = MOCK_LIBRARY_LOANS.filter((loan) => loan.status === 'Issued' || loan.status === 'Overdue');
  const overdue = MOCK_LIBRARY_LOANS.filter((loan) => loan.status === 'Overdue');
  const outstandingFine = MOCK_LIBRARY_LOANS.reduce((sum, loan) => sum + loan.fine, 0);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Learning management"
        title="Library"
        description="Approved campus notes, previous-year papers, e-books and your physical circulation record."
        icon={Library}
        tone="teal"
        actions={
          <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
            {[
              { id: 'digital', label: 'Digital vault' },
              { id: 'physical', label: 'My loans' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${view === item.id ? 'bg-teal-700 text-white' : 'text-slate-500 hover:text-deepNavy'}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Digital titles" value={MOCK_DIGITAL_RESOURCES.length} hint="All approved" icon={BookOpen} tone="teal" />
        <SoftStat label="Books on loan" value={activeLoans.length} hint="14-day window" icon={BookMarked} tone="blue" />
        <SoftStat label="Overdue" value={overdue.length} hint="₹10 per day fine" icon={AlertTriangle} tone="rose" />
        <SoftStat label="Outstanding fine" value={inr(outstandingFine)} hint="Pay at the desk" icon={Library} tone="amber" />
      </div>

      {view === 'digital' ? (
        <>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput value={query} onChange={setQuery} placeholder="Search title or author…" className="w-full sm:max-w-xs" tone="teal" />
            <div className="flex flex-wrap items-center gap-1">
              <Filter size={12} className="mr-0.5 text-slate-400" />
              {TYPES.map((item) => (
                <button
                  key={item}
                  onClick={() => setType(item)}
                  className={`rounded-lg px-2 py-1 text-[9.5px] font-bold transition-colors ${
                    type === item ? 'bg-teal-700 text-white' : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
            {resources.map((resource) => (
              <div
                key={resource.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs transition-all hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-bento"
              >
                <div className="flex items-start gap-2.5 p-3.5">
                  <span className="grid h-10 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-teal-600 to-teal-400 text-white shadow-2xs">
                    <FileText size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <Badge tone="teal">{resource.type}</Badge>
                      <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Sem {resource.semester}</span>
                    </div>
                    <h3 className="mt-1 line-clamp-2 text-[11.5px] font-extrabold leading-snug text-deepNavy">{resource.title}</h3>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-500">{resource.author}</p>
                  </div>
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 border-t border-slate-100 bg-slate-50/50 px-3 py-2">
                  <span className="inline-flex items-center gap-1 text-[8.5px] font-semibold text-slate-500">
                    <StatusBadge status={resource.status} />
                    <span className="hidden sm:inline">{formatDay(resource.added, 'd MMM')}</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setViewer(resource)}
                      className="grid h-7 w-7 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:text-teal-700"
                      aria-label={`Read ${resource.title}`}
                    >
                      <ExternalLink size={12} />
                    </button>
                    <button
                      onClick={() => {
                        setViewer(resource);
                        triggerPopup?.(`“${resource.title}” opened in the campus reader.`, 'info');
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-teal-700 px-2 py-1.5 text-[9px] font-bold text-white hover:bg-teal-800"
                    >
                      <Download size={10} /> Open
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!resources.length ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-10 text-center">
              <Search size={20} className="mx-auto text-slate-300" />
              <p className="mt-2 text-sm font-bold text-deepNavy font-jost">No resources matched</p>
              <p className="mt-1 text-xs text-slate-500">Try another type or search term.</p>
            </div>
          ) : null}
        </>
      ) : (
        <>
          <SectionCard
            title="Active loans"
            description="14-day lending window · ₹10 per day overdue fine"
            icon={BookMarked}
            tone="teal"
            bodyClassName="p-3"
          >
            <div className="space-y-1.5">
              {activeLoans.map((loan) => (
                <div
                  key={loan.id}
                  className={`flex flex-col gap-2 rounded-xl border px-3 py-2.5 sm:flex-row sm:items-center ${
                    loan.status === 'Overdue' ? 'border-rose-200 bg-rose-50/50' : 'border-slate-100'
                  }`}
                >
                  <span className={`grid h-9 w-8 shrink-0 place-items-center rounded-lg ${loan.status === 'Overdue' ? 'bg-rose-100 text-rose-700' : 'bg-teal-50 text-teal-700'}`}>
                    <BookOpen size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-deepNavy">{loan.title}</p>
                    <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-500">
                      {loan.author} · Copy {loan.copyId}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 sm:gap-5">
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Issued</p>
                      <p className="text-[10px] font-bold text-deepNavy">{formatDay(loan.issuedDate, 'd MMM')}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Due</p>
                      <p className={`text-[10px] font-bold ${loan.status === 'Overdue' ? 'text-rose-700' : 'text-deepNavy'}`}>
                        {formatDay(loan.dueDate, 'd MMM')}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-500">Fine</p>
                      <p className={`text-[10px] font-extrabold ${loan.fine ? 'text-rose-700' : 'text-emerald-700'}`}>{loan.fine ? inr(loan.fine) : '—'}</p>
                    </div>
                    <StatusBadge status={loan.status} />
                  </div>
                </div>
              ))}
            </div>
            {overdue.length ? (
              <div className="mt-2 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-rose-600" />
                <p className="text-[10px] font-semibold leading-relaxed text-rose-700">
                  One book is overdue. Fines accrue automatically at ₹10 per day and a reminder is emailed to your campus
                  address. Return it at the circulation desk to stop the fine.
                </p>
              </div>
            ) : null}
          </SectionCard>

          <SectionCard title="Return history" description="Books returned this semester" icon={RotateCcw} tone="slate" bodyClassName="p-3">
            <div className="space-y-1.5">
              {MOCK_LIBRARY_LOANS.filter((loan) => loan.status === 'Returned').map((loan) => (
                <div key={loan.id} className="flex items-center gap-3 rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className="grid h-9 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                    <BookOpen size={15} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[11px] font-bold text-deepNavy">{loan.title}</p>
                    <p className="mt-0.5 text-[9px] font-semibold text-slate-500">
                      Returned · {formatDay(loan.dueDate, 'd MMM yyyy')} · fine {inr(loan.fine)}
                    </p>
                  </div>
                  <Badge tone="emerald">Returned</Badge>
                </div>
              ))}
            </div>
          </SectionCard>
        </>
      )}

      <Modal
        open={Boolean(viewer)}
        onClose={() => setViewer(null)}
        title={viewer?.title || 'Library resource'}
        description={viewer ? `${viewer.type} · ${viewer.author} · Semester ${viewer.semester}` : undefined}
        size="lg"
        footer={
          viewer ? (
            <>
              <Button variant="secondary" size="sm" onClick={() => setViewer(null)}>
                Close
              </Button>
              <a href={viewer.url} target="_blank" rel="noreferrer">
                <Button size="sm" variant="teal" icon={Download}>
                  Download
                </Button>
              </a>
            </>
          ) : null
        }
      >
        {viewer ? <PdfViewer url={viewer.url} title={viewer.title} downloadEnabled /> : null}
      </Modal>
    </div>
  );
};

export default StudentDigitalLibraryTab;
