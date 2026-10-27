import { useMemo, useState } from 'react';
import { Calculator, RefreshCw, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

const INR = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0
});

const DEFAULTS = {
  students: 2500,
  adminHours: 38,
  printSpend: 20000
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

export const RoiCalculatorSection = () => {
  const [students, setStudents] = useState(DEFAULTS.students);
  const [adminHours, setAdminHours] = useState(DEFAULTS.adminHours);
  const [printSpend, setPrintSpend] = useState(DEFAULTS.printSpend);

  const numbers = useMemo(() => {
    const adminSaving = Math.round(adminHours * 52 * 500 * 0.35);
    const printSaving = Math.round(printSpend * 12 * 0.6);
    const annualSaving = adminSaving + printSaving;
    const licenceEstimate = Math.max(240000, students * 180);
    const paybackMonths = annualSaving > 0 ? Math.max(1, Math.round((licenceEstimate / annualSaving) * 12)) : 0;
    const savingPerStudent = students > 0 ? Math.round(annualSaving / students) : 0;

    return { adminSaving, printSaving, annualSaving, licenceEstimate, paybackMonths, savingPerStudent };
  }, [students, adminHours, printSpend]);

  const reset = () => {
    setStudents(DEFAULTS.students);
    setAdminHours(DEFAULTS.adminHours);
    setPrintSpend(DEFAULTS.printSpend);
  };

  return (
    <section id="roi" className="scroll-mt-24 border-y border-slate-200/70 bg-bgLight py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-container-max px-4 sm:px-6 lg:px-8">
        <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-white via-bgLight to-brand-50/70 p-4 shadow-bento sm:p-6 lg:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-brandBlue shadow-2xs">
                  <Calculator size={16} />
                </span>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-brandBlue">Return on effort</p>
                <Badge tone="amber">Illustrative model</Badge>
              </div>
              <h2 className="mt-3 text-balance text-3xl font-extrabold tracking-tight text-deepNavy sm:text-4xl">
                Estimate the admin time you could redirect.
              </h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Adjust three campus inputs to see a transparent annual saving and payback estimate. The model is
                deliberately simple, so you can challenge every assumption.
              </p>
            </div>
            <Button variant="secondary" size="sm" icon={RefreshCw} onClick={reset} className="self-start lg:self-auto">
              Reset inputs
            </Button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs sm:p-5">
              <div className="space-y-5">
                <div>
                  <div className="flex items-end justify-between gap-3">
                    <label htmlFor="roi-students" className="text-[11px] font-bold text-deepNavy">
                      Campus size
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="300"
                        max="12000"
                        step="100"
                        value={students}
                        onChange={(event) => setStudents(clamp(event.target.value, 300, 12000))}
                        aria-label="Campus size in students"
                        className="w-[82px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-[11px] font-bold text-deepNavy tabular outline-none focus-visible:border-brandBlue focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1"
                      />
                      <span className="text-xs font-semibold text-slate-600">students</span>
                    </div>
                  </div>
                  <input
                    id="roi-students"
                    type="range"
                    min="300"
                    max="12000"
                    step="100"
                    value={students}
                    onChange={(event) => setStudents(Number(event.target.value))}
                    className="mt-2 w-full accent-brandBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 rounded-lg"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                    <span>300</span>
                    <span>12,000</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <label htmlFor="roi-hours" className="text-[11px] font-bold text-deepNavy">
                      Administrative hours per week
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="5"
                        max="120"
                        step="1"
                        value={adminHours}
                        onChange={(event) => setAdminHours(clamp(event.target.value, 5, 120))}
                        aria-label="Administrative hours per week"
                        className="w-[76px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-[11px] font-bold text-deepNavy tabular outline-none focus-visible:border-brandBlue focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1"
                      />
                      <span className="text-xs font-semibold text-slate-600">h / week</span>
                    </div>
                  </div>
                  <input
                    id="roi-hours"
                    type="range"
                    min="5"
                    max="120"
                    step="1"
                    value={adminHours}
                    onChange={(event) => setAdminHours(Number(event.target.value))}
                    className="mt-2 w-full accent-brandBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 rounded-lg"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                    <span>5</span>
                    <span>120</span>
                  </div>
                  <p className="mt-1.5 text-[11px] font-medium leading-relaxed text-slate-600">
                    Manual rosters, eligibility checks, reminder calls and report assembly across the admin team.
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-5">
                  <div className="flex items-end justify-between gap-3">
                    <label htmlFor="roi-print" className="text-[11px] font-bold text-deepNavy">
                      Printing and forms spend
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="0"
                        max="100000"
                        step="1000"
                        value={printSpend}
                        onChange={(event) => setPrintSpend(clamp(event.target.value, 0, 100000))}
                        aria-label="Monthly printing and forms spend in rupees"
                        className="w-[92px] rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-right text-[11px] font-bold text-deepNavy tabular outline-none focus-visible:border-brandBlue focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-1"
                      />
                      <span className="text-xs font-semibold text-slate-600">₹ / month</span>
                    </div>
                  </div>
                  <input
                    id="roi-print"
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={printSpend}
                    onChange={(event) => setPrintSpend(Number(event.target.value))}
                    className="mt-2 w-full accent-brandBlue focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brandBlue focus-visible:ring-offset-2 rounded-lg"
                  />
                  <div className="mt-1 flex justify-between text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                    <span>₹0</span>
                    <span>₹1,00,000</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-deepNavy p-4 text-white shadow-bento sm:p-5">
              <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-52 w-52 rounded-full bg-brandBlue/30 blur-3xl" />
              <div aria-hidden="true" className="pointer-events-none absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-learningTeal/20 blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-white/55">Estimated annual saving</p>
                  <TrendingUp size={14} className="text-learningTeal" />
                </div>
                <p className="mt-2 font-jost text-[34px] font-extrabold leading-none tracking-tight text-white tabular sm:text-[40px]">
                  {INR.format(numbers.annualSaving)}
                </p>
                <p className="mt-1.5 text-[10px] font-semibold text-white/55">
                  About {INR.format(numbers.savingPerStudent)} per student per year
                </p>

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold text-white/55">Illustrative payback</span>
                    <span className="rounded-full bg-learningTeal/15 px-2.5 py-1 text-[10px] font-bold text-learningTeal">
                      {numbers.paybackMonths ? `~${numbers.paybackMonths} months` : '—'}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 border-t border-white/10 pt-2">
                    <span className="text-[9px] font-medium text-white/55">Licence estimate used for payback</span>
                    <span className="text-[10px] font-bold text-white/70 tabular">{INR.format(numbers.licenceEstimate)}</span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-medium text-white/55">Admin time redirected</span>
                    <span className="text-[11px] font-bold text-white/80 tabular">{INR.format(numbers.adminSaving)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-medium text-white/55">Printing and forms reduced</span>
                    <span className="text-[11px] font-bold text-white/80 tabular">{INR.format(numbers.printSaving)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3 border-t border-white/10 pt-2">
                    <span className="text-[10px] font-bold text-white/60">Total annual saving</span>
                    <span className="text-[12px] font-bold text-learningTeal tabular">{INR.format(numbers.annualSaving)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/75 p-4 sm:p-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-600">Assumptions behind the estimate</p>
              <Badge tone="slate">Not a quote or guarantee</Badge>
            </div>
            <ul className="mt-3 grid gap-1.5 text-xs font-medium leading-relaxed text-slate-600 sm:grid-cols-2">
              <li>52 operating weeks per year.</li>
              <li>35% of manual admin time redirected, at a blended ₹500 per hour.</li>
              <li>60% reduction in printing and forms spend.</li>
              <li>Licence estimate: ₹180 per active student per year, floor ₹2,40,000.</li>
              <li>Excludes hardware, travel, taxes and internal change management.</li>
              <li>Actual pricing depends on modules, scope and contract term.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoiCalculatorSection;
