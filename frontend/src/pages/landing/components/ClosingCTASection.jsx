import { Link } from 'react-router-dom';
import { ArrowRight, Check, Mail } from 'lucide-react';
import LiquidGlassPanel from '@/pages/landing/components/LiquidGlassPanel';

const READY_POINTS = ['Sandbox demo with sample data', 'No card required', 'Guided campus onboarding'];

export const ClosingCTASection = () => (
  <section className="relative overflow-hidden bg-deepNavy py-14 sm:py-16 lg:py-20">
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 landing-grid opacity-20" />
    <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-0 h-80 w-80 rounded-full bg-brandBlue/25 blur-3xl" />
    <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-learningTeal/15 blur-3xl" />

    <div className="relative mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
      <LiquidGlassPanel tone="dark" className="p-6 sm:p-9 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.35fr_0.65fr] lg:items-center">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-learningTeal">Ready when your campus is</p>
            <h2 className="mt-3 max-w-2xl text-balance text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl">
              One campus. One record. One place to start.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-white/55">
              Bring a single department or the whole institution. Start in the sandbox, map the real structure when you
              are ready, and keep the old spreadsheets as a fallback until the new week proves itself.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-4 gap-y-2">
              {READY_POINTS.map((point) => (
                <span key={point} className="flex items-center gap-1.5 text-[10px] font-semibold text-white/50">
                  <span className="grid h-4 w-4 place-items-center rounded-full bg-learningTeal/15 text-learningTeal">
                    <Check size={9} />
                  </span>
                  {point}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              to="/select-college"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold font-jost text-deepNavy shadow-bento transition-colors hover:bg-slate-100"
            >
              Find your campus <ArrowRight size={15} />
            </Link>
            <a
              href="mailto:support@amylearn.app?subject=AmyLearn%20walkthrough"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-bold font-jost text-white transition-colors hover:bg-white/10"
            >
              <Mail size={14} /> Talk to the team
            </a>
            <p className="mt-1 text-center text-[9px] font-medium text-white/55">
              support@amylearn.app · replies within two working days
            </p>
          </div>
        </div>
      </LiquidGlassPanel>
    </div>
  </section>
);

export default ClosingCTASection;
