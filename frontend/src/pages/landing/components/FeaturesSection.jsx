import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Building2, ChevronRight, ClipboardCheck, Layers, Library, Lock, ShieldCheck, Sparkles } from 'lucide-react';
import FeatureCard from '@/pages/landing/components/FeatureCard';

const TENANT_PROFILES = [
  { code: 'NBR', name: 'Northbridge University' },
  { code: 'MDN', name: 'Meridian Institute' },
  { code: 'CVL', name: 'Cedar Valley College' }
];

export const FeaturesSection = () => (
  <section id="features" className="relative scroll-mt-24 overflow-hidden bg-bgLight py-16 sm:py-20 lg:py-24">
    <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-brandBlue/5 blur-3xl" />
    <div className="relative mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Platform surface</p>
          <h2 className="mt-2 text-balance text-3xl font-extrabold leading-tight tracking-tight text-deepNavy sm:text-4xl">
            The work of a campus, without the seams.
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            Each module is useful on its own. Together they remove the handoffs where records drift, students wait and
            staff rebuild the same spreadsheet.
          </p>
        </div>
        <Link
          to="/for-institutions"
          className="inline-flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-[11px] font-bold text-deepNavy shadow-2xs transition-colors hover:border-brandBlue/30 hover:text-brandBlue lg:self-auto"
        >
          Read the institution brief <ArrowRight size={13} />
        </Link>
      </div>

      <div className="mt-9 grid gap-4 lg:grid-cols-3">
        <FeatureCard
          icon={Layers}
          badge="Academic core"
          tone="blue"
          title="ERP and academic structure"
          description="Model the institution the way it actually runs: departments, streams and subjects, with semester or trimester curricula underneath."
          bullets={[
            'Batches, physical classrooms and faculty allocation',
            'Roster building by roll range, ID sequence or manual enrolment',
            'One structure feeds attendance, examinations and learning'
          ]}
          className="lg:col-span-2"
        >
          <div className="rounded-xl border border-slate-200/80 bg-bgLight/80 p-3">
            <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-bold text-slate-500">
              <Building2 size={11} className="text-brandBlue" />
              Faculty of Engineering
              <ChevronRight size={9} className="text-slate-300" />
              6 departments
              <ChevronRight size={9} className="text-slate-300" />
              14 streams
            </div>
            <div className="mt-2 grid gap-1.5 sm:grid-cols-3">
              {['CSE · 3 streams', 'ECE · 2 streams', 'Mechanical · 2 streams'].map((item) => (
                <span key={item} className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[9px] font-semibold text-slate-600">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[8px] font-bold uppercase tracking-[0.1em] text-slate-500">
              <span>86 subjects</span>
              <span>14 active batches</span>
              <span>1,240 roster entries</span>
            </div>
          </div>
        </FeatureCard>

        <FeatureCard
          icon={ClipboardCheck}
          badge="Examinations"
          tone="indigo"
          title="COE without the exam-week scramble"
          description="Eligibility, forms and results follow the same term structure, so the exam cell stops reconciling three versions of the truth."
          bullets={[
            'Regular and backlog exam forms with a fee ledger',
            'QR-coded admit cards issued in bulk',
            'Marks upload, publish controls and semester feedback'
          ]}
        />

        <FeatureCard
          icon={BookOpen}
          badge="Learning"
          tone="teal"
          title="An LMS tied to the timetable"
          description="Lecture modules are grouped by topic, with documents and videos in the order faculty intended them to be studied."
          bullets={[
            'Per-content download switches controlled by faculty',
            'Completion tracking beside each module',
            'Cloudinary-hosted video without a separate portal'
          ]}
        />

        <FeatureCard
          icon={Library}
          badge="Circulation"
          tone="navy"
          title="Library operations that remind themselves"
          description="Physical loans, overdue reminders and a reviewed digital vault share one record, so the desk is not chasing paper slips."
          bullets={[
            '14-day standard loans with ₹10/day overdue fines',
            'Automated email alerts before and after due dates',
            'Admin approval for every digital resource'
          ]}
        />

        <FeatureCard
          icon={Sparkles}
          badge="AI assistance"
          tone="violet"
          title="Study support with a violet thread"
          description="A Socratic tutor, mind maps and file summaries live beside the course material. AI surfaces are the only place violet appears."
          bullets={[
            'Explanations that ask the next question, not just answer',
            'Mermaid mind maps for revision structure',
            'PDF, DOCX, XLSX, PPTX, image OCR and lecture video breakdown'
          ]}
        />

        <FeatureCard
          icon={ShieldCheck}
          badge="Multi-tenant"
          tone="blue"
          title="One deployment, many campuses — never mixed"
          description="Every request resolves to a campus and role before a query runs. College codes scope access; platform and campus feature flags decide what each role sees."
          className="lg:col-span-3"
        >
          <div className="grid gap-2 sm:grid-cols-3">
            {TENANT_PROFILES.map((campus) => (
              <div key={campus.code} className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-slate-100 text-slate-500">
                  <Lock size={12} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-bold text-deepNavy">{campus.name}</p>
                  <p className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    Tenant {campus.code} · isolated workspace
                  </p>
                </div>
              </div>
            ))}
          </div>
        </FeatureCard>
      </div>

      <div className="mt-6 flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white px-4 py-3">
        <ShieldCheck size={14} className="shrink-0 text-brandBlue" />
        <p className="text-[10px] font-semibold leading-relaxed text-slate-500">
          The same role and tenant rules apply across every module. A student at one campus cannot resolve another
          campus into their session.
        </p>
      </div>
    </div>
  </section>
);

export default FeaturesSection;
