import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, Check, Layers, School, Users } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: School,
    title: 'Find your campus',
    copy: 'Start with the college code issued by your institution. Students, faculty and administrators sign in through the same campus, with the role deciding what opens.',
    points: ['No app install for students', 'Campus code keeps the tenant boundary explicit', 'Institution can add or retire campuses centrally']
  },
  {
    number: '02',
    icon: Layers,
    title: 'Map the academic structure',
    copy: 'The onboarding team maps departments, streams, subjects and semester or trimester rules, then builds batches and active rosters from a guided template.',
    points: ['Roster by roll range, ID sequence or manual list', 'Classrooms, timetable periods and faculty allocation', 'Exam eligibility rules agreed before the first form opens']
  },
  {
    number: '03',
    icon: Users,
    title: 'Switch on role portals',
    copy: 'Pilot one department, confirm the handoffs and then widen access. Feature flags decide which modules each role sees; the platform team can adjust them without a redeploy.',
    points: ['Student, faculty and campus-admin workspaces', 'Publish notices and the academic calendar', 'Review the pilot before campus-wide rollout']
  }
];

export const HowItWorksSection = () => (
  <section id="how-it-works" className="scroll-mt-24 border-y border-slate-200/70 bg-white py-16 sm:py-20 lg:py-24">
    <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">From code to campus</p>
        <h2 className="mt-2 text-balance text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
          Three steps, one operating model.
        </h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">
          Most campuses complete the first pass in two to four weeks. The sequence is deliberate: structure first, then
          people, then the modules that depend on both.
        </p>
      </div>

      <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
        <div aria-hidden="true" className="pointer-events-none absolute left-[16%] right-[16%] top-7 hidden h-px bg-gradient-to-r from-brandBlue/20 via-learningTeal/50 to-brandBlue/20 lg:block" />
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="relative rounded-3xl border border-slate-200/80 bg-bgLight/70 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <span className="relative z-10 grid h-11 w-11 place-items-center rounded-2xl bg-white text-brandBlue shadow-bento">
                  <Icon size={19} />
                </span>
                <span className="font-jost text-2xl font-extrabold tracking-tight text-slate-200">{step.number}</span>
              </div>
              <p className="mt-4 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">
                {index === 0 ? 'Access' : index === 1 ? 'Configuration' : 'Rollout'}
              </p>
              <h3 className="mt-1 text-xl font-extrabold text-deepNavy">{step.title}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-500">{step.copy}</p>
              <ul className="mt-4 space-y-1.5 border-t border-slate-200/70 pt-4">
                {step.points.map((point) => (
                  <li key={point} className="flex items-start gap-1.5 text-[11px] font-medium leading-5 text-slate-600">
                    <span className="mt-0.5 grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full bg-white text-brandBlue shadow-2xs">
                      <Check size={8} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl border border-brandBlue/10 bg-brand-50/60 px-4 py-4 sm:flex-row sm:items-center sm:px-5">
        <div className="flex items-start gap-2.5">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-white text-brandBlue shadow-2xs">
            <CalendarDays size={15} />
          </span>
          <div>
            <p className="text-xs font-bold text-deepNavy">Typical onboarding: 2–4 weeks</p>
            <p className="mt-0.5 text-[10px] font-medium leading-relaxed text-slate-500">
              Actual timing depends on how clean your department, subject and roster data is today.
            </p>
          </div>
        </div>
        <Link
          to="/for-institutions#onboarding"
          className="inline-flex shrink-0 items-center gap-1.5 text-[11px] font-bold text-brandBlue transition-colors hover:text-brand-700"
        >
          See the onboarding plan <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
