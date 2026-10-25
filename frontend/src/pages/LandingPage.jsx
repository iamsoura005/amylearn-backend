import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Check,
  ClipboardCheck,
  Layers,
  Library,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { GlassHeader } from '@/components/global/GlassHeader';
import { Footer } from '@/components/global/Footer';
import { ScrollToTop } from '@/components/global/ScrollToTop';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

const NAV_LINKS = [
  { label: 'For institutions', to: '/for-institutions' },
  { label: 'For students', to: '/for-students' },
  { label: 'Current site', to: '/' }
];

const FEATURES = [
  {
    icon: Layers,
    title: 'Academic ERP',
    copy: 'Departments, streams, subjects, semester and trimester curricula, batches, classrooms and dynamic rosters in one structure.',
    tone: 'bg-blue-50 text-brandBlue'
  },
  {
    icon: ClipboardCheck,
    title: 'Examination cell',
    copy: 'Eligibility, regular and backlog forms, fee ledgers, QR admit cards, bulk marks upload and controlled result publishing.',
    tone: 'bg-indigo-50 text-indigo-700'
  },
  {
    icon: BookOpen,
    title: 'Learning modules',
    copy: 'Lecture content grouped by topic, with documents, streaming video, download switches and completion tracking.',
    tone: 'bg-teal-50 text-teal-700'
  },
  {
    icon: Library,
    title: 'Library circulation',
    copy: 'Fourteen-day loans, overdue fine tracking, automated email alerts and a reviewed digital resource vault.',
    tone: 'bg-slate-100 text-deepNavy'
  },
  {
    icon: CalendarDays,
    title: 'Attendance and timetable',
    copy: 'Daily faculty marking, student self-view, weekly attendance reports and batch routines with period-level detail.',
    tone: 'bg-blue-50 text-brandBlue'
  },
  {
    icon: Sparkles,
    title: 'AI study support',
    copy: 'A Socratic tutor, Mermaid mind maps, multimodal file summaries and lecture video breakdowns for revision.',
    tone: 'bg-ai-50 text-ai-600'
  }
];

export const LandingPage = () => (
  <div className="min-h-screen bg-bgLight">
    <div className="bg-deepNavy px-4 py-2 text-center text-[9px] font-semibold uppercase tracking-[0.12em] text-white/50">
      Legacy overview ·{' '}
      <Link to="/" className="font-bold text-white underline underline-offset-2">
        See the current AmyLearn site
      </Link>
    </div>

    <GlassHeader links={NAV_LINKS} />

    <main>
      <section className="relative overflow-hidden border-b border-slate-200/70 gradient-mesh">
        <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 opacity-60" />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:py-24">
          <Badge tone="blue" dot className="mb-4">
            AmyLearn · Classic overview
          </Badge>
          <h1 className="text-balance text-[34px] font-extrabold leading-[1.08] tracking-tight text-deepNavy sm:text-5xl">
            A calmer way to run your campus.
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-slate-600">
            One multi-tenant platform for academic operations, examinations, learning, library circulation and AI study
            support. Each campus keeps its own secure workspace behind a college code.
          </p>
          <div className="mt-7 flex flex-col justify-center gap-2.5 sm:flex-row">
            <Link
              to="/select-college"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-brandBlue px-5 py-3 text-sm font-bold font-jost text-white shadow-[0_10px_24px_-12px_rgba(30,99,214,0.8)] transition-colors hover:bg-brand-700"
            >
              Find your campus <ArrowRight size={15} />
            </Link>
            <Link
              to="/for-institutions"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold font-jost text-deepNavy shadow-2xs transition-colors hover:bg-slate-50"
            >
              For institutions
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2">
            {['Browser based', 'Tenant isolated', 'Guided onboarding'].map((item) => (
              <span key={item} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <Check size={11} className="text-brandBlue" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">What is inside</p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
              The core campus modules.
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Six connected surfaces, one academic structure and one role model across the platform.
            </p>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} hover className="h-full p-5">
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${feature.tone}`}>
                    <Icon size={18} />
                  </span>
                  <h3 className="mt-4 text-lg font-extrabold text-deepNavy">{feature.title}</h3>
                  <p className="mt-2 text-xs leading-6 text-slate-500">{feature.copy}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200/70 bg-bgLight py-10">
        <div className="mx-auto grid max-w-container-max gap-4 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
          {[
            { value: '6', label: 'Connected modules' },
            { value: '2–4 weeks', label: 'Typical guided onboarding' },
            { value: '99.9%', label: 'Uptime target, not a guarantee' }
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-200/80 bg-white px-5 py-4 text-center">
              <p className="font-jost text-2xl font-extrabold text-deepNavy">{stat.value}</p>
              <p className="mt-1 text-[10px] font-semibold text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mx-auto mt-3 max-w-container-max px-4 text-center text-[9px] font-medium text-slate-500 sm:px-6 lg:px-8">
          Illustrative operating targets, not customer metrics.
        </p>
      </section>

      <section className="bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl bg-deepNavy px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-center">
              <div>
                <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-learningTeal">
                  <ShieldCheck size={12} /> Start with the sandbox
                </p>
                <h2 className="mt-3 max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-3xl">
                  Explore the platform before you move a single record.
                </h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-white/50">
                  Use a demo campus with sample data, then bring your real departments, subjects and rosters during
                  guided onboarding.
                </p>
              </div>
              <div className="flex flex-col gap-2">
                <Link
                  to="/select-college"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-deepNavy transition-colors hover:bg-slate-100"
                >
                  Find your campus <ArrowRight size={13} />
                </Link>
                <Link
                  to="/for-institutions"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-white/10"
                >
                  Institution brief
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>

    <Footer tone="dark" />
    <ScrollToTop />
  </div>
);

export default LandingPage;
