import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  FileText,
  GraduationCap,
  Library,
  Mail,
  Sparkles,
  Users,
  Video
} from 'lucide-react';
import PublicPageShell from '@/pages/public/PublicPageShell';
import ProductPreview from '@/pages/landing/components/ProductPreview';

const STUDENT_LINKS = [
  { label: 'AI study', href: '#ai' },
  { label: 'Learning', href: '#learning' },
  { label: 'Results', href: '#results' },
  { label: 'Library', href: '#library' },
  { label: 'Parents', href: '#parents' }
];

const CTA_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 py-3 text-sm font-bold font-jost text-white shadow-[0_10px_24px_-12px_rgba(30,99,214,0.8)] transition-colors hover:bg-brand-700';
const CTA_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold font-jost text-deepNavy shadow-2xs transition-colors hover:bg-slate-50';

export const ForStudentsPage = () => (
  <PublicPageShell
    eyebrow="For students"
    title="Your academic week, in one quiet place."
    description="Timetable, attendance, course material, library loans, exam documents and an AI study companion — inside the campus workspace your institution already runs."
    breadcrumb={[{ label: 'For students' }]}
    actions={
      <>
        <Link to="/select-college" className={CTA_PRIMARY}>
          Find your campus <ArrowRight size={15} />
        </Link>
        <a href="#ai" className={CTA_SECONDARY}>
          How AI study works
        </a>
      </>
    }
  >
    <div className="space-y-10 lg:space-y-12">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">One campus login</p>
          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">
            Less hunting. More studying.
          </h2>
          <p className="mt-3 text-xs leading-7 text-slate-500">
            Your institution issues the college code. Sign in once and the workspace opens to your timetable, current
            modules, attendance and the documents you need next — no separate app, no five browser bookmarks.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {[
              { icon: CalendarDays, label: 'Today’s timetable', detail: 'Rooms and changes in one view' },
              { icon: ClipboardCheck, label: 'Attendance', detail: 'Marked by faculty, visible to you' },
              { icon: BookOpen, label: 'Course modules', detail: 'Notes and video by topic' },
              { icon: Library, label: 'Library', detail: 'Loans, due dates and digital resources' }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-brandBlue">
                    <Icon size={13} />
                  </span>
                  <div>
                    <p className="text-[10px] font-bold text-deepNavy">{item.label}</p>
                    <p className="mt-0.5 text-[8px] font-semibold text-slate-500">{item.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 flex items-start gap-1.5 text-[10px] font-medium leading-5 text-slate-500">
            <GraduationCap size={12} className="mt-0.5 shrink-0 text-slate-300" />
            Access is controlled by your institution. If your campus is not live yet, ask your academic office.
          </p>
        </div>

        <div className="relative min-w-0">
          <div aria-hidden="true" className="pointer-events-none absolute -inset-4 -z-10 rounded-[34px] bg-gradient-to-tr from-brandBlue/10 via-skyBlue/10 to-learningTeal/15 blur-2xl" />
          <ProductPreview role="student" />
          <p className="mt-2 text-center text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-500">
            Illustrative student workspace
          </p>
        </div>
      </section>

      <nav aria-label="Student sections" className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {STUDENT_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-1.5 text-[10px] font-bold text-slate-500 transition-colors hover:bg-brand-50 hover:text-brandBlue"
            >
              {link.label}
            </a>
          ))}
        </div>
      </nav>

      <section id="ai" className="scroll-mt-24 rounded-3xl border border-ai-200/60 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ai-50 text-ai-600">
                <Sparkles size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ai-600">Study support</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">A tutor that asks before it tells.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              The AI study companion is built for the moment you are stuck, not the moment you want the answer sheet. Its
              Socratic mode explains one step, checks what you understood and asks the next question. You can switch to a
              plain explanation when you need one.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Upload a PDF, DOCX, XLSX, PPTX or a photo of handwritten notes and ask for a summary; OCR handles scanned
              pages. A lecture recording can be broken into sections, with a revision brief and a mind map you can
              revisit before an internal assessment.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              AI is a study aid, not a source of record. Verify formulas, citations and answers against faculty material.
              Your institution can switch AI modules off for the campus, and your uploaded content is not used to train
              foundation models without written instruction.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Socratic explanations and follow-up questions',
                'Mermaid mind maps for revision',
                'Summaries for documents and scanned images',
                'Lecture video breakdown',
                'Flashcard-style revision prompts',
                'Available in the browser, no install'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-ai-50 text-ai-600">
                    <Check size={8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-ai-200/60 bg-ai-50/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ai-700">Study preview</p>
              <span className="rounded-full border border-ai-200 bg-white px-2 py-0.5 text-[8px] font-bold text-ai-700">CSE · Sem 5</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="ml-auto max-w-[88%] rounded-xl rounded-br-sm bg-white px-3 py-2 shadow-2xs">
                <p className="text-[8px] font-semibold leading-relaxed text-slate-600">
                  I keep confusing 2NF and 3NF. Can you quiz me with our library example?
                </p>
              </div>
              <div className="max-w-[94%] rounded-xl rounded-bl-sm border border-ai-200/70 bg-white px-3 py-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded bg-gradient-to-br from-ai-500 to-ai-300 text-white">
                    <Sparkles size={8} />
                  </span>
                  <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-ai-700">Amy AI · Socratic mode</p>
                </div>
                <p className="mt-1.5 text-[8px] font-medium leading-relaxed text-slate-600">
                  In the loan table, student name depends on student id, not on the loan id. Is that a partial dependency
                  or a transitive one? Start there.
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['Give me a hint', 'Show mind map', '5 practice questions'].map((chip) => (
                    <span key={chip} className="rounded-full border border-ai-200 bg-ai-50 px-1.5 py-0.5 text-[6.5px] font-bold text-ai-700">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-2 rounded-lg border border-ai-200/60 bg-white px-2.5 py-2">
              <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-ai-700">This week’s study set</p>
              <p className="mt-0.5 text-[8px] font-semibold text-slate-500">12 flashcards · 3 mind maps · 1 lecture brief</p>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-ai-700/60">
              Illustrative AI output · verify with faculty material
            </p>
          </div>
        </div>
      </section>

      <section id="learning" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <BookOpen size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Learning</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Your modules, in the order they were taught.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Lectures are grouped by topic, not dumped into one long file list. Each module shows its documents and
              videos together, with a completion marker so you can see what is still open before the next class.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Faculty decide what can be downloaded. Some readings stay in the browser; others are available as a PDF.
              Video is streamed, so you can start watching without waiting for a large file.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              The timetable, room changes and departmental notices sit beside the course, which matters more than a
              feature list when a lab moves to another building at short notice.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Modules grouped by topic',
                'Documents and streamed video',
                'Completion visible to you and faculty',
                'Download availability set per item',
                'Timetable with room details',
                'Department notices in the same workspace'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-teal-50 text-teal-600">
                    <Check size={8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-bgLight p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Current course</p>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[8px] font-bold text-teal-700">72%</span>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-[10px] font-bold text-deepNavy">Database systems</p>
              <p className="text-[8px] font-semibold text-slate-500">Semester 5 · Prof. Iyer · 20 modules</p>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-brandBlue to-learningTeal" />
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { icon: FileText, title: 'Normalisation notes', meta: 'PDF · 12 pages · download on', tag: 'Open' },
                  { icon: Video, title: 'Lecture 09 · 3NF', meta: 'Video · 42 min · streamed', tag: 'New' },
                  { icon: FileText, title: 'Tutorial 04', meta: 'PDF · opens after Friday', tag: 'Held' }
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.title} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50/60 px-2.5 py-2">
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-white text-brandBlue shadow-2xs">
                        <Icon size={9} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[8px] font-bold text-deepNavy">{row.title}</p>
                        <p className="truncate text-[7px] font-semibold text-slate-500">{row.meta}</p>
                      </div>
                      <span className="shrink-0 rounded bg-white px-1.5 py-0.5 text-[6.5px] font-bold text-slate-500">{row.tag}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative course view</p>
          </div>
        </div>
      </section>

      <section id="results" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <ClipboardCheck size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Results and records</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Know where you stand, without asking around.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Attendance, internal marks and examination status are visible in one place. When the exam cell publishes
              results, they appear against the correct semester; until then, the workspace does not show a leaked or
              half-verified mark.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              The exam form, QR admit card and fee ledger share the same record. If a payment is pending or an eligibility
              check fails, you can see which item is blocking the form instead of calling three offices.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Semester feedback is collected in the same portal. Results and attendance are owned by your institution;
              AmyLearn displays what the campus publishes and keeps a record of the change.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Attendance by subject and overall',
                'Internal marks when released',
                'Exam form status and fee ledger',
                'QR-coded admit card',
                'Published semester results',
                'Semester feedback in the portal'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-indigo-50 text-indigo-600">
                    <Check size={8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-bgLight p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Semester snapshot</p>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-bold text-indigo-700">Sem 5</span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {[
                { label: 'Attendance', value: '92%', hint: 'Above 75% requirement' },
                { label: 'CGPA', value: '8.4', hint: 'Semester 4' },
                { label: 'Exam form', value: 'Submitted', hint: 'Regular · fee paid' },
                { label: 'Backlogs', value: '0', hint: 'No active backlog' }
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-slate-200 bg-white px-2.5 py-2">
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                  <p className="mt-0.5 text-[13px] font-extrabold text-deepNavy tabular">{item.value}</p>
                  <p className="mt-0.5 text-[7px] font-semibold text-slate-500">{item.hint}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[8px] font-bold text-deepNavy">Admit card · Semester 5</p>
                  <p className="text-[7px] font-semibold text-slate-500">Released by the exam cell</p>
                </div>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">Ready</span>
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg bg-slate-50 px-2 py-1.5">
                <span className="grid h-8 w-8 place-items-center rounded bg-white text-deepNavy shadow-2xs">
                  <span className="grid grid-cols-3 gap-px">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <span key={index} className={`h-1 w-1 ${index % 3 === 1 ? 'bg-deepNavy' : 'bg-slate-300'}`} />
                    ))}
                  </span>
                </span>
                <div>
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">QR verification</p>
                  <p className="text-[8px] font-semibold text-slate-500">NBR2024CS042 · CSE-5B</p>
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative student record</p>
          </div>
        </div>
      </section>

      <section id="library" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 text-deepNavy">
                <Library size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Library</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Borrow, return, and know the due date.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Physical loans follow the campus cycle: fourteen days, with a ₹10 per day overdue fine. Your active loans
              and due dates appear in the workspace, and the library sends an email reminder before the book is due.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Digital resources live in a separate vault. Each item is reviewed by library staff before it is published,
              so a scanned note or lab manual does not appear without approval.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              If a book is already on loan, the desk can see the circulation record instead of checking a paper register.
              Fines and returns are recorded against the same student account used for fees and examination forms.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                '14-day standard loan period',
                '₹10/day overdue fine',
                'Email reminder before the due date',
                'Current loans in your workspace',
                'Reviewed digital vault',
                'No separate library password to remember'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                    <Check size={8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-bgLight p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Your loans</p>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-bold text-slate-500">2 active</span>
            </div>
            <div className="mt-3 space-y-1.5">
              {[
                { title: 'Database System Concepts', meta: 'Due 02 Nov 2026 · 14-day loan', fine: '₹0', tone: 'emerald' },
                { title: 'Computer Networks', meta: 'Due 05 Nov 2026 · 14-day loan', fine: '₹0', tone: 'emerald' }
              ].map((loan) => (
                <div key={loan.title} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-[9px] font-bold text-deepNavy">{loan.title}</p>
                      <p className="mt-0.5 text-[7px] font-semibold text-slate-500">{loan.meta}</p>
                    </div>
                    <span className="shrink-0 rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">
                      Fine {loan.fine}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
              <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-500">Digital vault</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-600">
                  <FileText size={9} className="text-slate-400" /> Unit 4 scanned notes
                </span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">Approved</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="flex items-center gap-1.5 text-[8px] font-semibold text-slate-600">
                  <FileText size={9} className="text-slate-400" /> Previous year papers
                </span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">Approved</span>
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative library view</p>
          </div>
        </div>
      </section>

      <section id="parents" className="scroll-mt-24 overflow-hidden rounded-3xl bg-deepNavy p-5 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-learningTeal">Parents and institutions</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              Students do not sign up on their own.
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-6 text-white/50">
              AmyLearn is licensed to the institution, and access comes from campus enrolment. Parents can ask the
              academic office whether the campus is live; institutions can review the deployment, security and onboarding
              brief before issuing a single account.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                <Users size={11} className="text-learningTeal" /> Students and faculty use the same campus code
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                <Mail size={11} className="text-learningTeal" /> support@amylearn.app
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link
              to="/for-institutions"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-deepNavy transition-colors hover:bg-slate-100"
            >
              For institutions <ArrowRight size={13} />
            </Link>
            <Link
              to="/select-college"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              Find your campus
            </Link>
            <a
              href="mailto:support@amylearn.app?subject=AmyLearn%20student%20access"
              className="text-center text-[9px] font-semibold text-white/55 transition-colors hover:text-white/80"
            >
              Ask about student access
            </a>
          </div>
        </div>
      </section>

      <p className="text-center text-[9px] font-medium leading-relaxed text-slate-500">
        Screens shown on this page are illustrative. Your campus configures modules, labels and available resources.
        Access and academic records are controlled by your institution.
      </p>
    </div>
  </PublicPageShell>
);

export default ForStudentsPage;
