import { useState } from 'react';
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Download,
  FileCheck2,
  GraduationCap,
  IndianRupee,
  ListChecks,
  Send,
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/common/PageHeader';
import { Button } from '@/components/ui/Button';
import { Badge, StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { SectionCard, SoftStat, daysUntil, formatDay, inr } from './shared/StudentTabKit';
import { MOCK_EXAM_FORM, MOCK_EXAM_SESSIONS } from '@/pages/auth/campus-student/constants/campusStudentConstants';

const ELIGIBILITY = [
  { label: 'Attendance at or above 75%', value: '87%', passed: true },
  { label: 'CGPA above 5.0', value: '8.42', passed: true },
  { label: 'No active disciplinary action', value: 'Clear', passed: true },
  { label: 'Examination fee reconciled', value: 'Paid', passed: true }
];

export const StudentExamFormTab = ({ session, triggerPopup }) => {
  const [submitted, setSubmitted] = useState(MOCK_EXAM_FORM.submitted);
  const [backlog, setBacklog] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const papers = MOCK_EXAM_FORM.papers.filter((paper) => paper.type === 'Regular' || backlog);
  const credits = papers.reduce((sum, paper) => sum + paper.credits, 0);
  const deadlineDays = daysUntil(MOCK_EXAM_FORM.deadline);

  const submit = () => {
    setProcessing(true);
    window.setTimeout(() => {
      setProcessing(false);
      setSubmitted(true);
      setConfirmOpen(false);
      triggerPopup?.('Examination form submitted. Your admit card will be refreshed within 24 hours.', 'success');
    }, 800);
  };

  const download = () => {
    const lines = [
      'AmyLearn · Examination form acknowledgement',
      `Student: ${session?.name || 'Aarav Sharma'}`,
      `Roll number: ${session?.rollNumber || 'NBR2024CS042'}`,
      `Session: ${MOCK_EXAM_FORM.session}`,
      `Submitted: ${formatDay(MOCK_EXAM_FORM.submittedAt, 'd MMM yyyy, h:mm a')}`,
      `Receipt: ${MOCK_EXAM_FORM.receipt}`,
      '',
      'Registered papers:',
      ...papers.map((paper) => `${paper.code}  ${paper.title}  ${paper.type}  ${formatDay(paper.date)}`)
    ];
    const url = URL.createObjectURL(new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `amylearn-exam-form-${session?.rollNumber || 'NBR2024CS042'}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
    triggerPopup?.('Examination form acknowledgement downloaded.', 'success');
  };

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Examinations office"
        title="Examination form"
        description="Check eligibility, choose regular and backlog papers, reconcile the fee ledger and submit before the deadline."
        icon={ListChecks}
        tone="sky"
        actions={
          submitted ? (
            <Button variant="white" size="sm" icon={Download} onClick={download}>
              Acknowledgement
            </Button>
          ) : (
            <Button size="sm" icon={Send} onClick={() => setConfirmOpen(true)}>
              Submit form
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 xl:grid-cols-4">
        <SoftStat label="Session" value="Odd 2026" hint={MOCK_EXAM_FORM.session.split('·')[1]?.trim() || 'November 2026'} icon={CalendarDays} tone="sky" />
        <SoftStat label="Regular papers" value={MOCK_EXAM_FORM.eligibleRegular} hint="Eligible" icon={FileCheck2} tone="blue" />
        <SoftStat label="Backlog papers" value={MOCK_EXAM_FORM.eligibleBacklog} hint="CS301 · Data Structures" icon={GraduationCap} tone="amber" />
        <SoftStat label="Form status" value={submitted ? 'Submitted' : 'Draft'} hint={submitted ? formatDay(MOCK_EXAM_FORM.submittedAt, 'd MMM') : `${deadlineDays} days to deadline`} icon={BadgeCheck} tone={submitted ? 'emerald' : 'violet'} />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <div className="space-y-3 xl:col-span-2">
          <SectionCard title="Eligibility" description="Verified against your academic record" icon={ShieldCheck} tone="emerald" bodyClassName="p-3">
            <div className="grid gap-1.5 sm:grid-cols-2">
              {ELIGIBILITY.map((item) => (
                <div key={item.label} className="flex items-center gap-2 rounded-xl border border-slate-100 px-2.5 py-2">
                  <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${item.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {item.passed ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[9.5px] font-semibold text-slate-600">{item.label}</p>
                    <p className="text-[8px] font-bold text-slate-500">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-start gap-2 rounded-xl bg-emerald-50 px-2.5 py-2">
              <BadgeCheck size={13} className="mt-0.5 shrink-0 text-emerald-600" />
              <p className="text-[9px] font-semibold text-emerald-800">You are eligible for all regular papers. One backlog paper can be added at no extra cost.</p>
            </div>
          </SectionCard>

          <SectionCard
            title="Papers to register"
            description={`${papers.length} papers · ${credits} credits`}
            icon={ListChecks}
            tone="sky"
            action={<Badge tone="sky">{submitted ? 'Locked' : 'Selectable'}</Badge>}
            bodyClassName="p-3"
          >
            <div className="space-y-1.5">
              {MOCK_EXAM_FORM.papers.map((paper) => {
                const isBacklog = paper.type === 'Backlog';
                const selected = paper.type === 'Regular' || backlog;
                return (
                  <div
                    key={paper.id}
                    className={`flex items-center gap-2.5 rounded-xl border px-3 py-2.5 ${
                      selected ? 'border-sky-100 bg-sky-50/40' : 'border-slate-100 bg-white'
                    }`}
                  >
                    <button
                      onClick={() => {
                        if (submitted) {
                          triggerPopup?.('Submitted forms are locked. Contact the exams office to make changes.', 'warning');
                          return;
                        }
                        if (isBacklog) setBacklog((value) => !value);
                      }}
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border ${
                        selected ? 'border-sky-600 bg-sky-600 text-white' : 'border-slate-300 text-transparent'
                      }`}
                      aria-label={`${selected ? 'Deselect' : 'Select'} ${paper.title}`}
                    >
                      <CheckCircle2 size={11} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-[8.5px] font-extrabold text-sky-700">{paper.code}</span>
                        <Badge tone={isBacklog ? 'amber' : 'sky'}>{paper.type}</Badge>
                      </div>
                      <p className="mt-0.5 truncate text-[10.5px] font-bold text-deepNavy">{paper.title}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[9px] font-bold text-deepNavy">{formatDay(paper.date, 'd MMM')}</p>
                      <p className="text-[8px] font-semibold text-slate-500">{paper.session}</p>
                    </div>
                    <span className="hidden shrink-0 text-[8.5px] font-bold text-slate-500 sm:block">{paper.credits} cr</span>
                  </div>
                );
              })}
            </div>
            {!submitted ? (
              <p className="mt-2 text-[8.5px] font-semibold text-slate-500">
                Regular papers are mandatory. Backlog papers are optional; the CS301 Data Structures paper can be dropped if
                you do not plan to clear it this session.
              </p>
            ) : null}
          </SectionCard>

          <SectionCard title="Exam sessions" description="Current and previous sessions" icon={CalendarDays} tone="violet" bodyClassName="p-3">
            <div className="space-y-1.5">
              {MOCK_EXAM_SESSIONS.map((item) => (
                <div key={item.id} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-3 py-2.5">
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700">
                    <CalendarDays size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10.5px] font-bold text-deepNavy">{item.name}</p>
                    <p className="text-[8.5px] font-semibold text-slate-500">
                      {formatDay(item.start, 'd MMM')} – {formatDay(item.end, 'd MMM yyyy')} · {item.papers} papers
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="space-y-3">
          <SectionCard
            title={submitted ? 'Submitted' : 'Submission summary'}
            description={submitted ? `Submitted ${formatDay(MOCK_EXAM_FORM.submittedAt, 'd MMM yyyy, h:mm a')}` : `Deadline ${formatDay(MOCK_EXAM_FORM.deadline)}`}
            icon={submitted ? BadgeCheck : ClipboardCheck}
            tone={submitted ? 'emerald' : 'sky'}
            bodyClassName="p-3.5"
          >
            {submitted ? (
              <div className="space-y-2">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <p className="flex items-center gap-1.5 text-[9.5px] font-bold text-emerald-800">
                    <BadgeCheck size={13} /> Form accepted
                  </p>
                  <p className="mt-1 text-[8.5px] font-semibold leading-relaxed text-emerald-700">
                    Your examination form is with the examinations office. Admit card and seat allocation refresh within
                    24 hours.
                  </p>
                </div>
                <div className="divide-y divide-slate-50">
                  <div className="flex items-center justify-between py-1.5 text-[9px]">
                    <span className="font-semibold text-slate-500">Papers</span>
                    <span className="font-bold text-deepNavy">{papers.length}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-[9px]">
                    <span className="font-semibold text-slate-500">Credits</span>
                    <span className="font-bold text-deepNavy">{credits}</span>
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-[9px]">
                    <span className="font-semibold text-slate-500">Fee status</span>
                    <StatusBadge status={MOCK_EXAM_FORM.paymentStatus} />
                  </div>
                  <div className="flex items-center justify-between py-1.5 text-[9px]">
                    <span className="font-semibold text-slate-500">Receipt</span>
                    <span className="text-[8px] font-bold text-deepNavy">{MOCK_EXAM_FORM.receipt}</span>
                  </div>
                </div>
                <Button variant="white" size="sm" icon={Download} className="w-full" onClick={download}>
                  Download acknowledgement
                </Button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="rounded-xl bg-sky-50 p-3">
                  <p className="text-[8px] font-bold uppercase tracking-wide text-sky-500">Amount payable</p>
                  <p className="mt-0.5 text-2xl font-extrabold leading-none text-sky-900 font-jost tabular">{inr(MOCK_EXAM_FORM.fee)}</p>
                  <p className="mt-1 text-[8.5px] font-semibold text-sky-700">Regular + backlog examination fee</p>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-semibold text-slate-500">Papers selected</span>
                  <span className="font-bold text-deepNavy">{papers.length}</span>
                </div>
                <div className="flex items-center justify-between text-[9px]">
                  <span className="font-semibold text-slate-500">Deadline</span>
                  <span className="font-bold text-deepNavy">{formatDay(MOCK_EXAM_FORM.deadline)}</span>
                </div>
                <div className="flex items-start gap-1.5 rounded-lg bg-amber-50 px-2 py-1.5">
                  <AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-600" />
                  <p className="text-[8px] font-semibold text-amber-800">
                    {deadlineDays} days left. Late submissions require a condonation request with the COE.
                  </p>
                </div>
                <Button size="sm" className="w-full" icon={Send} onClick={() => setConfirmOpen(true)}>
                  Review and submit
                </Button>
              </div>
            )}
          </SectionCard>

          <SectionCard title="Fee ledger" description="Examination fee broken down" icon={IndianRupee} tone="amber" bodyClassName="p-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Regular papers (5)</span>
                <span className="font-bold text-deepNavy">{inr(2000)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Backlog paper (1)</span>
                <span className="font-bold text-deepNavy">{inr(400)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-slate-100 py-1.5 text-[10px]">
                <span className="font-bold text-slate-600">Total</span>
                <span className="font-extrabold text-deepNavy">{inr(MOCK_EXAM_FORM.fee)}</span>
              </div>
              <div className="flex items-center justify-between py-1 text-[9px]">
                <span className="font-semibold text-slate-500">Status</span>
                <StatusBadge status={MOCK_EXAM_FORM.paymentStatus} />
              </div>
            </div>
            <p className="mt-1.5 rounded-lg bg-slate-50 px-2 py-1.5 text-[8px] font-semibold leading-relaxed text-slate-500">
              Receipt {MOCK_EXAM_FORM.receipt} · paid on 20 October 2026.
            </p>
          </SectionCard>

          <SectionCard title="Need to change papers?" icon={ShieldCheck} tone="rose" bodyClassName="p-3.5">
            <p className="text-[9px] leading-relaxed text-slate-500">
              Paper changes are allowed until 30 October through a written request to the examinations office. After the
              deadline, only medical condonation is accepted.
            </p>
          </SectionCard>
        </div>
      </div>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Confirm examination form"
        description={MOCK_EXAM_FORM.session}
        size="sm"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(false)}>
              Go back
            </Button>
            <Button size="sm" icon={Send} loading={processing} onClick={submit}>
              Confirm & submit
            </Button>
          </>
        }
      >
        <div className="space-y-2.5">
          <div className="rounded-xl border border-sky-200 bg-sky-50 p-3">
            <p className="text-[9px] font-bold text-sky-900">{papers.length} papers · {credits} credits</p>
            <p className="mt-0.5 text-[8.5px] font-semibold text-sky-700">
              {papers.filter((paper) => paper.type === 'Regular').length} regular and {papers.filter((paper) => paper.type === 'Backlog').length} backlog paper
            </p>
          </div>
          <p className="text-[10px] leading-relaxed text-slate-600">
            By submitting you confirm that the papers listed are correct, the examination fee is reconciled, and you will
            abide by the campus examination code of conduct.
          </p>
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 px-2.5 py-2 text-[9px]">
            <span className="font-semibold text-emerald-800">Fee status</span>
            <span className="font-extrabold text-emerald-800">Paid · {inr(MOCK_EXAM_FORM.fee)}</span>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StudentExamFormTab;
