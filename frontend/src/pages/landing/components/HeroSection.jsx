import { useNavigate } from 'react-router-dom';
import { ArrowRight, Building2, Check, Sparkles, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import LiquidGlassPanel from '@/pages/landing/components/LiquidGlassPanel';
import ProductPreview from '@/pages/landing/components/ProductPreview';

const SIGNALS = [
  'Tenant-isolated by design',
  'Works in any modern browser',
  'Guided onboarding in weeks'
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden gradient-mesh pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-16">
      <div aria-hidden="true" className="landing-grid pointer-events-none absolute inset-0 opacity-70" />
      <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-skyBlue/15 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-learningTeal/15 blur-3xl" />

      <div className="relative mx-auto grid max-w-container-max items-center gap-12 px-4 sm:px-6 lg:grid-cols-[1.02fr_1.08fr] lg:gap-10 lg:px-8">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-2 rounded-full border border-brandBlue/15 bg-white/70 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-brandBlue shadow-2xs backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-learningTeal" />
            Unified academic platform
          </span>

          <h1 className="mt-5 max-w-xl text-balance text-[34px] font-extrabold leading-[1.06] tracking-tight text-deepNavy sm:text-5xl lg:text-[56px]">
            Run your campus as <span className="primary-gradient-text">one connected system.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600 sm:text-[15px]">
            AmyLearn brings academic planning, examinations, attendance, learning, library circulation and AI study
            support into one calm workspace. Every campus stays separate behind its own college code.
          </p>

          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Button
              size="lg"
              iconRight={ArrowRight}
              onClick={() => navigate('/select-college')}
              className="w-full px-5 py-3 sm:w-auto"
            >
              Find your campus
            </Button>
            <Button
              size="lg"
              variant="secondary"
              icon={Building2}
              onClick={() => navigate('/for-institutions')}
              className="w-full px-5 py-3 sm:w-auto"
            >
              For institutions
            </Button>
          </div>

          <p className="mt-3 text-[10px] font-medium text-slate-500">
            No card required to explore. Campus access is issued by your institution.
          </p>

          <div className="mt-7 grid gap-2 sm:grid-cols-3">
            {SIGNALS.map((signal) => (
              <div key={signal} className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500">
                <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-white text-brandBlue shadow-2xs">
                  <Check size={9} />
                </span>
                {signal}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full min-w-0 max-w-[600px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -inset-5 -z-10 rounded-[38px] bg-gradient-to-tr from-brandBlue/20 via-skyBlue/10 to-learningTeal/20 blur-2xl"
          />
          <ProductPreview role="admin" />

          <LiquidGlassPanel className="absolute -left-6 top-28 hidden w-44 p-3 lg:block">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-50 text-brandBlue">
                <Users size={13} />
              </span>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-500">Attendance posted</p>
                <p className="truncate text-[11px] font-extrabold text-deepNavy">CSE-5B · 92.4%</p>
              </div>
            </div>
            <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-slate-200/70">
              <div className="h-full w-[92%] rounded-full bg-gradient-to-r from-brandBlue to-learningTeal" />
            </div>
          </LiquidGlassPanel>

          <LiquidGlassPanel className="absolute -right-5 bottom-14 hidden w-48 p-3 lg:block">
            <div className="flex items-start gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-ai-500 to-ai-300 text-white">
                <Sparkles size={13} />
              </span>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-ai-700">AI study set ready</p>
                <p className="mt-0.5 text-[9px] font-semibold leading-snug text-slate-500">
                  12 flashcards and 3 mind maps from this week&apos;s notes.
                </p>
              </div>
            </div>
          </LiquidGlassPanel>

          <p className="mt-3 text-center text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
            Illustrative interface — your campus configures modules and labels
          </p>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
