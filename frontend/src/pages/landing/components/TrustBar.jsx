import { Badge } from '@/components/ui/Badge';

const METRICS = [
  { value: '2–4 weeks', label: 'Typical guided onboarding' },
  { value: '6', label: 'Connected campus modules' },
  { value: '14 days', label: 'Standard library loan cycle' },
  { value: '99.9%', label: 'Uptime target, not a guarantee' }
];

const CAMPUS_PROFILES = [
  { name: 'Northbridge University', monogram: 'NU', code: 'NBR', note: 'Multi-department campus' },
  { name: 'Meridian Institute of Technology', monogram: 'MI', code: 'MDN', note: 'Trimester programmes' },
  { name: 'Cedar Valley College', monogram: 'CV', code: 'CVL', note: 'Arts and sciences' },
  { name: 'Harbourline Business School', monogram: 'HB', code: 'HBR', note: 'Postgraduate cohort' }
];

export const TrustBar = () => (
  <section className="border-y border-slate-200/70 bg-white">
    <div className="mx-auto max-w-container-max px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Operating reality</p>
          <h2 className="mt-1.5 max-w-lg text-xl font-extrabold tracking-tight text-deepNavy sm:text-2xl">
            Built around the weekly rhythm of a real campus.
          </h2>
        </div>
        <Badge tone="blue" dot className="self-start sm:self-auto">
          Illustrative benchmarks — not customer claims
        </Badge>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200/70 bg-slate-200/70 lg:grid-cols-4">
        {METRICS.map((metric) => (
          <div key={metric.label} className="bg-white px-4 py-4 sm:px-5">
            <p className="font-jost text-xl font-extrabold tracking-tight text-deepNavy sm:text-2xl">{metric.value}</p>
            <p className="mt-1 text-[10px] font-semibold leading-snug text-slate-500">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Composite campus profiles</p>
          <p className="text-[9px] font-medium text-slate-500">Fictional examples for configuration only — not endorsements.</p>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {CAMPUS_PROFILES.map((campus) => (
            <div key={campus.name} className="flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-bgLight/70 px-3 py-2.5">
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-deepNavy font-jost text-[10px] font-bold text-white">
                {campus.monogram}
              </span>
              <div className="min-w-0">
                <p className="truncate text-[10px] font-bold text-deepNavy">{campus.name}</p>
                <p className="truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                  Code {campus.code} · {campus.note}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default TrustBar;
