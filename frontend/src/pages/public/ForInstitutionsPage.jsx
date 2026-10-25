import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Building2,
  CalendarDays,
  Check,
  ClipboardCheck,
  Cloud,
  Database,
  GraduationCap,
  KeyRound,
  Layers,
  Library,
  Lock,
  Mail,
  QrCode,
  Server,
  ShieldCheck,
  Sparkles,
  Wallet
} from 'lucide-react';
import PublicPageShell from '@/pages/public/PublicPageShell';

const MODULE_LINKS = [
  { label: 'ERP', href: '#erp' },
  { label: 'Examinations', href: '#coe' },
  { label: 'Learning', href: '#lms' },
  { label: 'Library', href: '#library' },
  { label: 'AI', href: '#ai' },
  { label: 'Security', href: '#security' },
  { label: 'Onboarding', href: '#onboarding' },
  { label: 'Pricing', href: '#pricing' }
];

const VALUE_POINTS = [
  {
    icon: Layers,
    title: 'An academic core that holds',
    copy: 'Departments, streams, subjects, curricula and rosters are defined once. Every downstream module reads the same structure instead of rebuilding it.'
  },
  {
    icon: ClipboardCheck,
    title: 'An exam cycle that closes',
    copy: 'Eligibility, forms, fees, admit cards, marks and results stay in one ledger, with a clear owner at each step and a publish control at the end.'
  },
  {
    icon: GraduationCap,
    title: 'A student front door',
    copy: 'Timetable, attendance, course material, library loans, fees and exam documents live in one browser workspace scoped to the campus.'
  }
];

const CTA_PRIMARY =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 py-3 text-sm font-bold font-jost text-white shadow-[0_10px_24px_-12px_rgba(30,99,214,0.8)] transition-colors hover:bg-brand-700';
const CTA_SECONDARY =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold font-jost text-deepNavy shadow-2xs transition-colors hover:bg-slate-50';

const ONBOARDING = [
  {
    week: 'Week 0',
    title: 'Discovery and scope',
    copy: 'A working session with the registrar, exam cell, library and campus administration. We agree the modules in scope and what a successful first term looks like.',
    points: ['Current handoffs mapped', 'Roles and approvers named']
  },
  {
    week: 'Week 1',
    title: 'Structure and data mapping',
    copy: 'Departments, streams, subjects, semester or trimester rules, batches and active rosters are mapped from a guided template and reviewed against the source.',
    points: ['Exceptions reviewed with your team', 'Roster method agreed']
  },
  {
    week: 'Week 2',
    title: 'Pilot department',
    copy: 'One department goes live first: accounts, timetable, attendance and the learning workspace. Faculty and student feedback is collected before wider access.',
    points: ['Role-based training', 'Pilot issues resolved in place']
  },
  {
    week: 'Weeks 3–4',
    title: 'Campus rollout',
    copy: 'Remaining departments are switched on, examination or fee cycles are rehearsed, and the old process is retired only when the new record is verified.',
    points: ['Notice and calendar published', 'Support rhythm agreed']
  }
];

const SECURITY = [
  {
    icon: Lock,
    title: 'Tenant context at query time',
    copy: 'A session resolves to a user, active campus membership and role before data is read. Campus-scoped queries filter by tenant; a college code alone grants nothing.'
  },
  {
    icon: KeyRound,
    title: 'JWT sessions with revocation',
    copy: 'Access tokens are checked server-side and can be revoked. Role changes and deactivations take effect without waiting for a browser tab to expire.'
  },
  {
    icon: Mail,
    title: 'OTP mail through Gmail SMTP',
    copy: 'Registration and verification codes are delivered by our configured mail service. Support messages and library alerts use the same controlled channel.'
  },
  {
    icon: Cloud,
    title: 'Cloudinary for media',
    copy: 'Lecture video, documents and OCR uploads are stored and delivered through Cloudinary. Per-content download switches are enforced in the application.'
  },
  {
    icon: Database,
    title: 'CockroachDB persistence',
    copy: 'Academic records live in CockroachDB through Prisma. Backups and retention are governed by the agreement and the privacy policy, not by ad hoc exports.'
  },
  {
    icon: Server,
    title: 'Vercel-hosted client',
    copy: 'The React client is served by Vercel over HTTPS. The API runs separately; browser sessions carry authentication and tenant headers on every request.'
  }
];

const PLANS = [
  {
    name: 'Campus core',
    icon: Layers,
    summary: 'For a single campus replacing registers, shared drives and manual follow-ups.',
    modules: ['Academic ERP and rosters', 'Attendance and timetable', 'Learning modules (LMS)', 'Library circulation', 'Notices and calendars'],
    basis: 'Quoted per campus, by active student count'
  },
  {
    name: 'Complete campus',
    icon: ClipboardCheck,
    summary: 'The core plus the full examination cycle, for institutions that want one academic record end to end.',
    modules: ['Everything in Campus core', 'COE eligibility and exam forms', 'Fee ledger and QR admit cards', 'Bulk marks and result publishing', 'Semester feedback'],
    basis: 'Quoted per campus, modules bundled',
    featured: true
  },
  {
    name: 'Multi-campus group',
    icon: Building2,
    summary: 'For trusts and groups that need shared platform controls without mixing campus data.',
    modules: ['Everything in Complete campus', 'Multiple campus tenants', 'Platform and campus feature flags', 'Group onboarding sequence', 'Named support rhythm'],
    basis: 'Quoted per group after discovery'
  }
];

export const ForInstitutionsPage = () => (
  <PublicPageShell
    eyebrow="For institutions"
    title="One campus platform, from admission rosters to published results."
    description="AmyLearn connects the academic core, examinations, learning, library circulation and AI study support without flattening the way your institution actually works. Each campus keeps its own tenant, roles and configuration."
    breadcrumb={[{ label: 'For institutions' }]}
    actions={
      <>
        <Link to="/select-college" className={CTA_PRIMARY}>
          Find your campus <ArrowRight size={15} />
        </Link>
        <a href="#contact" className={CTA_SECONDARY}>
          Book a walkthrough
        </a>
      </>
    }
  >
    <div className="space-y-10 lg:space-y-12">
      <section aria-labelledby="institution-value">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">The operating case</p>
            <h2 id="institution-value" className="mt-1.5 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">
              Fewer reconciliations. Clearer accountability.
            </h2>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Built for Indian higher education</span>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {VALUE_POINTS.map((point) => {
            const Icon = point.icon;
            return (
              <div key={point.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brandBlue">
                  <Icon size={16} />
                </span>
                <h3 className="mt-3 text-base font-extrabold text-deepNavy">{point.title}</h3>
                <p className="mt-1.5 text-[11px] leading-6 text-slate-500">{point.copy}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 sm:grid-cols-3">
          {[
            { value: '6', label: 'Connected modules' },
            { value: '1', label: 'Tenant boundary per campus' },
            { value: '2–4 weeks', label: 'Typical guided onboarding' }
          ].map((item) => (
            <div key={item.label} className="bg-white px-4 py-3">
              <p className="font-jost text-xl font-extrabold text-deepNavy">{item.value}</p>
              <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </section>

      <nav aria-label="Module sections" className="rounded-2xl border border-slate-200/80 bg-white p-2 shadow-2xs">
        <div className="flex flex-wrap gap-1.5">
          {MODULE_LINKS.map((link) => (
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

      <section id="erp" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brandBlue">
                <Layers size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Module 01 · ERP</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Academic structure, modelled once.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              AmyLearn starts with the hierarchy your institution already uses: departments, streams and subjects, with
              semester or trimester curricula underneath. Batches, physical classrooms and faculty allocation sit on the
              same record, so attendance, examinations and learning do not invent their own version of a class.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Rosters can be built by roll range, ID sequence or a manual list, which matters when a new elective cuts
              across three departments. Changes are made in the academic core and flow to the modules that depend on it.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Department → stream → subject hierarchy',
                'Semester and trimester programme rules',
                'Batches, classrooms and period routines',
                'Dynamic rosters with exception handling'
              ].map((item) => (
                <li key={item} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                  <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-blue-50 text-brandBlue">
                    <Check size={8} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-bgLight p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Structure preview</p>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[8px] font-bold text-blue-700">Semester 5</span>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-deepNavy text-white">
                  <Building2 size={12} />
                </span>
                <div>
                  <p className="text-[10px] font-bold text-deepNavy">Faculty of Engineering</p>
                  <p className="text-[8px] font-semibold text-slate-500">6 departments · 14 streams</p>
                </div>
              </div>
              <div className="ml-3 mt-3 space-y-1.5 border-l-2 border-brandBlue/15 pl-3">
                {[
                  { name: 'Computer Science', detail: '3 streams · 24 subjects' },
                  { name: 'Electronics', detail: '2 streams · 18 subjects' },
                  { name: 'Mechanical', detail: '2 streams · 21 subjects' }
                ].map((row) => (
                  <div key={row.name} className="rounded-lg border border-slate-100 bg-slate-50/70 px-2.5 py-1.5">
                    <p className="text-[9px] font-bold text-deepNavy">{row.name}</p>
                    <p className="text-[7px] font-semibold text-slate-500">{row.detail}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                { value: '86', label: 'Subjects' },
                { value: '14', label: 'Batches' },
                { value: '1,240', label: 'Rosters' }
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center">
                  <p className="text-[11px] font-extrabold text-deepNavy tabular">{item.value}</p>
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">{item.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative structure</p>
          </div>
        </div>
      </section>

      <section id="coe" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-50 text-indigo-700">
                <ClipboardCheck size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Module 02 · COE</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">The examination cell, without the parallel ledger.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Eligibility is checked against the term structure and attendance record before a form is accepted. Regular
              and backlog forms share one queue, and the fee ledger shows what has been paid, what is pending and which
              submission is blocked by which item.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Admit cards are issued with a QR code once eligibility and fees clear. Marks arrive through a bulk upload,
              are reviewed by the exam cell, and only become visible to students when the result is published. Semester
              feedback closes the loop without a separate form tool.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Eligibility checks by term structure',
                'Regular and backlog form queues',
                'Fee ledger with submission status',
                'QR-coded admit cards in bulk',
                'Bulk marks upload and review',
                'Publish or unpublish results'
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
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Exam readiness</p>
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[8px] font-bold text-indigo-700">Semester 5</span>
            </div>
            <div className="mt-3 space-y-2.5 rounded-xl border border-slate-200 bg-white p-3">
              {[
                { label: 'Eligibility checked', value: '1,248', width: '100%', tone: 'bg-brandBlue' },
                { label: 'Forms submitted', value: '1,196', width: '96%', tone: 'bg-brandBlue' },
                { label: 'Fees reconciled', value: '92%', width: '92%', tone: 'bg-learningTeal' },
                { label: 'Admit cards issued', value: '1,142', width: '91%', tone: 'bg-learningTeal' }
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-semibold text-slate-500">{row.label}</span>
                    <span className="text-[8px] font-bold text-deepNavy tabular">{row.value}</span>
                  </div>
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${row.tone}`} style={{ width: row.width }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-2">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-indigo-50 text-indigo-600">
                <QrCode size={11} />
              </span>
              <div className="min-w-0">
                <p className="text-[8px] font-bold text-deepNavy">Admit card batch ready</p>
                <p className="text-[7px] font-semibold text-slate-500">1,142 cards · QR verified · awaiting release</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative exam cycle</p>
          </div>
        </div>
      </section>

      <section id="lms" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-teal-700">
                <BookOpen size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Module 03 · LMS</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Learning material that follows the timetable.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Faculty build lecture modules by topic, with documents and videos in the order they intend students to
              work through them. A module can expose a reading now and hold a solution set until after the tutorial,
              using a per-content download switch.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Completion tracking gives faculty a quiet view of progress without another spreadsheet. Video is streamed
              through Cloudinary, so a large recording does not have to be downloaded before it can be watched.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                'Modules grouped by topic',
                'Documents and streamed video',
                'Per-content download control',
                'Student completion tracking',
                'Timetable-linked course view',
                'Access follows campus enrolment'
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
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Course preview</p>
              <span className="rounded-full border border-teal-200 bg-teal-50 px-2 py-0.5 text-[8px] font-bold text-teal-700">CSE-5B</span>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-deepNavy">Database systems</p>
                  <p className="text-[8px] font-semibold text-slate-500">20 modules · 2 faculty · 64 students</p>
                </div>
                <span className="rounded-md bg-teal-50 px-1.5 py-1 text-[7px] font-bold text-teal-700">72%</span>
              </div>
              <div className="mt-3 space-y-1.5">
                {[
                  { title: '01 · Foundations', meta: '4 items · complete', state: 'done' },
                  { title: '02 · ER modelling', meta: '5 items · complete', state: 'done' },
                  { title: '03 · Normalisation', meta: '4 items · 72% complete', state: 'active' },
                  { title: '04 · Transactions', meta: '6 items · opens Friday', state: 'locked' }
                ].map((row) => (
                  <div
                    key={row.title}
                    className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 ${
                      row.state === 'active' ? 'border-brandBlue/20 bg-blue-50/50' : 'border-slate-100 bg-slate-50/60'
                    }`}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full ${
                        row.state === 'done'
                          ? 'bg-emerald-50 text-emerald-600'
                          : row.state === 'active'
                            ? 'bg-brandBlue text-white'
                            : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {row.state === 'done' ? <Check size={9} /> : <Lock size={8} />}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[8px] font-bold text-deepNavy">{row.title}</p>
                      <p className="truncate text-[7px] font-semibold text-slate-500">{row.meta}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative course module</p>
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
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">Module 04 · Library</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Circulation with a memory.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              Physical loans run on a fourteen-day cycle with a ₹10 per day overdue fine. Reminder emails are queued
              before the due date and follow up after it, so the desk is not relying on a paper slip or a phone call.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              The digital vault is separate from circulation: every resource enters an approval queue before students
              see it, and library credentials are stored encrypted. Staff can review what is pending without leaving the
              campus console.
            </p>
            <ul className="mt-4 grid gap-1.5 sm:grid-cols-2">
              {[
                '14-day standard loan period',
                '₹10/day overdue fine tracking',
                'Automated due and overdue email',
                'Digital vault approval workflow',
                'Encrypted library credentials',
                'Student loan view in the portal'
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
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">Circulation preview</p>
              <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[8px] font-bold text-slate-500">2 active loans</span>
            </div>
            <div className="mt-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold text-deepNavy">Database System Concepts</p>
                  <p className="text-[8px] font-semibold text-slate-500">A. Korth · Acc. 0142</p>
                </div>
                <span className="rounded-md bg-emerald-50 px-1.5 py-1 text-[7px] font-bold text-emerald-700">On loan</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-1.5">
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">Due date</p>
                  <p className="text-[8px] font-bold text-deepNavy">02 Nov 2026</p>
                </div>
                <div className="rounded-lg bg-slate-50 px-2 py-1.5">
                  <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-500">Overdue fine</p>
                  <p className="text-[8px] font-bold text-deepNavy">₹0</p>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-blue-100 bg-blue-50/60 px-2 py-1.5">
                <Mail size={10} className="text-brandBlue" />
                <p className="text-[7px] font-semibold text-slate-500">Reminder queued for 31 Oct 2026</p>
              </div>
            </div>
            <div className="mt-2 rounded-xl border border-slate-200 bg-white p-2.5">
              <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-500">Digital vault</p>
              <div className="mt-1.5 flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-slate-600">Unit 4 scanned notes</span>
                <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[7px] font-bold text-emerald-700">Approved</span>
              </div>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="text-[8px] font-semibold text-slate-600">Lab manual 2026</span>
                <span className="rounded bg-amber-50 px-1.5 py-0.5 text-[7px] font-bold text-amber-700">Pending review</span>
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-slate-500">Illustrative library record</p>
          </div>
        </div>
      </section>

      <section id="ai" className="scroll-mt-24 rounded-3xl border border-slate-200/80 bg-white p-5 shadow-2xs sm:p-7">
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-ai-50 text-ai-600">
                <Sparkles size={16} />
              </span>
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-ai-600">Module 05 · AI assistance</p>
            </div>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Help that asks the next question.</h2>
            <p className="mt-3 text-xs leading-7 text-slate-500">
              The study companion is built around a Socratic tutor mode: it explains a step, checks understanding and
              suggests a better next question rather than handing over a finished answer. Mermaid mind maps turn a topic
              into a revision structure that students can revisit.
            </p>
            <p className="mt-2 text-xs leading-7 text-slate-500">
              Students can summarise PDF, DOCX, XLSX, PPTX and image uploads, with OCR for scanned pages. A lecture
              recording can be broken into sections and a revision brief. Inference runs on a self-hosted open-source GPU
              pipeline, and AI modules can be switched off per campus through feature flags.
            </p>
            <div className="mt-4 rounded-xl border border-ai-200/70 bg-ai-50/60 px-3 py-2.5">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ai-700">Privacy boundary</p>
              <p className="mt-1 text-[10px] font-medium leading-relaxed text-slate-500">
                Institution content is not used to train foundation models without written instruction. Outputs stay in
                the campus workspace. See the{' '}
                <Link to="/privacy" className="font-bold text-ai-700 underline underline-offset-2">
                  privacy policy
                </Link>{' '}
                for retention and processor details.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-ai-200/60 bg-ai-50/40 p-3.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-ai-700">AI study preview</p>
              <span className="rounded-full border border-ai-200 bg-white px-2 py-0.5 text-[8px] font-bold text-ai-700">Tenant NBR</span>
            </div>
            <div className="mt-3 space-y-2">
              <div className="ml-auto max-w-[85%] rounded-xl rounded-br-sm bg-white px-3 py-2 shadow-2xs">
                <p className="text-[8px] font-semibold leading-relaxed text-slate-600">
                  Explain 3NF using our library loan example, then quiz me.
                </p>
              </div>
              <div className="max-w-[92%] rounded-xl rounded-bl-sm border border-ai-200/70 bg-white px-3 py-2 shadow-2xs">
                <div className="flex items-center gap-1.5">
                  <span className="grid h-4 w-4 place-items-center rounded bg-gradient-to-br from-ai-500 to-ai-300 text-white">
                    <Sparkles size={8} />
                  </span>
                  <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-ai-700">Amy AI</p>
                </div>
                <p className="mt-1.5 text-[8px] font-medium leading-relaxed text-slate-600">
                  Start with the loan table: loan id, student id, book id. Which non-key fact depends on another
                  non-key field?
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {['Mind map', '5 flashcards', 'Past paper link'].map((chip) => (
                    <span key={chip} className="rounded-full border border-ai-200 bg-ai-50 px-1.5 py-0.5 text-[6.5px] font-bold text-ai-700">
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="mt-2 text-center text-[7px] font-semibold uppercase tracking-[0.1em] text-ai-700/60">
              Illustrative AI surface · can be disabled per campus
            </p>
          </div>
        </div>
      </section>

      <section id="security" className="scroll-mt-24">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Deployment and security</p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">A shared platform with a firm campus boundary.</h2>
          </div>
          <Link to="/privacy" className="inline-flex items-center gap-1 text-[10px] font-bold text-brandBlue hover:text-brand-700">
            Read the privacy policy <ArrowRight size={11} />
          </Link>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-500">
          AmyLearn runs as one deployment serving many campuses. Isolation is logical and enforced at query time: the
          authenticated session resolves a tenant before data is read, and campus-scoped queries include that tenant
          filter. The browser never gets to choose a tenant on its own.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SECURITY.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon size={14} />
                </span>
                <h3 className="mt-2.5 text-sm font-extrabold text-deepNavy">{item.title}</h3>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">{item.copy}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-4 rounded-2xl border border-amber-200/70 bg-amber-50/60 px-4 py-3">
          <p className="text-[10px] font-bold text-amber-800">A note on certifications</p>
          <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-amber-700/80">
            This page does not claim ISO, SOC 2 or any other certification. Security documentation, data-processing terms
            and subprocessor details are available during procurement. Ask for the current pack rather than relying on a
            badge.
          </p>
        </div>
      </section>

      <section id="onboarding" className="scroll-mt-24">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Onboarding</p>
            <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">A paced rollout, not a big-bang switch.</h2>
          </div>
          <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-slate-500">Indicative timeline · 2–4 weeks</span>
        </div>
        <p className="mt-3 max-w-3xl text-xs leading-7 text-slate-500">
          The plan below is the default sequence. A single-campus institution with clean department data can move faster;
          a multi-campus group with examination exceptions may need longer. The pilot gate is not negotiable: one
          department should complete a real week before campus-wide access opens.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {ONBOARDING.map((step, index) => (
            <div key={step.week} className="relative rounded-2xl border border-slate-200/80 bg-white p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full border border-brandBlue/15 bg-brand-50 px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.1em] text-brandBlue">
                  {step.week}
                </span>
                <span className="font-jost text-lg font-extrabold text-slate-200">0{index + 1}</span>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-deepNavy">{step.title}</h3>
              <p className="mt-1.5 text-[10px] leading-5 text-slate-500">{step.copy}</p>
              <ul className="mt-2.5 space-y-1 border-t border-slate-100 pt-2">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-1.5 text-[9px] font-semibold leading-4 text-slate-500">
                    <Check size={9} className="mt-0.5 shrink-0 text-learningTeal" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
          <CalendarDays size={14} className="mt-0.5 shrink-0 text-brandBlue" />
          <p className="text-[10px] font-medium leading-relaxed text-slate-500">
            Training happens around your calendar: administrator sessions before the pilot, faculty sessions before
            attendance goes live, and student orientation before the first exam form opens. Examination and fee cycles
            are rehearsed with sample records before they touch real students.
          </p>
        </div>
      </section>

      <section id="pricing" className="scroll-mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Pricing</p>
          <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-deepNavy sm:text-3xl">Scoped to the campus you actually run.</h2>
          <p className="mt-3 text-xs leading-7 text-slate-500">
            There is no public per-seat price because module mix, active student count, implementation scope and contract
            term all move the number. Every quote is written after a discovery call and includes the onboarding scope.
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-3xl border bg-white p-5 ${
                  plan.featured ? 'border-brandBlue/30 shadow-bento' : 'border-slate-200/80 shadow-2xs'
                }`}
              >
                {plan.featured ? (
                  <span className="absolute right-4 top-4 rounded-full bg-brandBlue px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-white">
                    Recommended bundle
                  </span>
                ) : null}
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brandBlue">
                  <Icon size={16} />
                </span>
                <h3 className="mt-3 text-lg font-extrabold text-deepNavy">{plan.name}</h3>
                <p className="mt-1 text-[10px] leading-5 text-slate-500">{plan.summary}</p>
                <p className="mt-3 border-y border-slate-100 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-500">
                  {plan.basis}
                </p>
                <ul className="mt-3 flex-1 space-y-1.5">
                  {plan.modules.map((module) => (
                    <li key={module} className="flex items-start gap-1.5 text-[10px] font-medium leading-5 text-slate-600">
                      <Check size={10} className="mt-0.5 shrink-0 text-learningTeal" />
                      {module}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:support@amylearn.app?subject=AmyLearn%20pricing%20request"
                  className={`mt-4 inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[11px] font-bold ${
                    plan.featured
                      ? 'bg-brandBlue text-white hover:bg-brand-700'
                      : 'border border-slate-200 bg-slate-50 text-deepNavy hover:bg-white'
                  }`}
                >
                  Request a scoped quote <ArrowRight size={12} />
                </a>
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 rounded-2xl border border-slate-200/80 bg-white px-4 py-3">
          {['Guided onboarding included', 'Role-based training', 'Feature flags per campus', 'Named support channel'].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-[9px] font-semibold text-slate-500">
              <Check size={10} className="text-learningTeal" /> {item}
            </span>
          ))}
        </div>
      </section>

      <section id="contact" className="scroll-mt-24 overflow-hidden rounded-3xl bg-deepNavy p-5 text-white sm:p-8">
        <div className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-learningTeal">Next step</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
              Show us the handoff that costs the most time.
            </h2>
            <p className="mt-2 max-w-xl text-xs leading-6 text-white/50">
              A walkthrough uses a sandbox campus, not your live data. Bring one real workflow — eligibility, a backlog
              form, a library reminder — and we will map it end to end. You will get a scoped quote only after that
              conversation, not before.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                <Mail size={11} className="text-learningTeal" /> support@amylearn.app
              </span>
              <span className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                <ShieldCheck size={11} className="text-learningTeal" /> No card required
              </span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <a
              href="mailto:support@amylearn.app?subject=AmyLearn%20institution%20walkthrough"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-deepNavy transition-colors hover:bg-slate-100"
            >
              Book a walkthrough <ArrowRight size={13} />
            </a>
            <Link
              to="/select-college"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
            >
              Find your campus
            </Link>
            <Link
              to="/terms"
              className="text-center text-[9px] font-semibold text-white/55 transition-colors hover:text-white/80"
            >
              Terms of service
            </Link>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-3">
        <Wallet size={13} className="shrink-0 text-slate-400" />
        <p className="text-[9px] font-medium leading-relaxed text-slate-500">
          Prices, timelines and capacity figures on this page are illustrative until confirmed in a written quote or
          agreement. No page on this site is a binding offer.
        </p>
      </div>
    </div>
  </PublicPageShell>
);

export default ForInstitutionsPage;
