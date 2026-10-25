import { motion } from 'framer-motion';

const TONES = {
  blue: { wrap: 'bg-blue-50 text-brandBlue', bar: 'bg-brandBlue' },
  teal: { wrap: 'bg-teal-50 text-teal-700', bar: 'bg-teal-600' },
  indigo: { wrap: 'bg-indigo-50 text-indigo-700', bar: 'bg-indigo-600' },
  violet: { wrap: 'bg-violet-50 text-violet-700', bar: 'bg-violet-600' },
  emerald: { wrap: 'bg-emerald-50 text-emerald-700', bar: 'bg-emerald-500' },
  amber: { wrap: 'bg-amber-50 text-amber-700', bar: 'bg-amber-500' },
  red: { wrap: 'bg-red-50 text-red-700', bar: 'bg-red-500' },
  ai: { wrap: 'bg-ai-50 text-ai-600', bar: 'bg-ai-500' }
};

export const StatCard = ({ label, value, icon: Icon, tone = 'blue', hint, delta, progress, className = '' }) => {
  const t = TONES[tone] || TONES.blue;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-4 shadow-2xs transition-shadow hover:shadow-bento ${className}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
        {Icon ? (
          <span className={`grid h-8 w-8 place-items-center rounded-xl ${t.wrap}`}>
            <Icon size={15} />
          </span>
        ) : null}
      </div>
      <p className="mt-2 text-[26px] font-extrabold leading-none tracking-tight text-deepNavy font-jost tabular">{value}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        {typeof delta === 'number' ? (
          <span
            className={`inline-flex items-center gap-0.5 text-[10px] font-bold ${
              delta >= 0 ? 'text-emerald-700' : 'text-red-700'
            }`}
          >
            <span className="material-symbols-outlined text-[13px]">{delta >= 0 ? 'trending_up' : 'trending_down'}</span>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
        ) : null}
        {hint ? <span className="text-[10px] text-slate-500">{hint}</span> : null}
      </div>
      {typeof progress === 'number' ? (
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-100">
          <div className={`h-full rounded-full ${t.bar}`} style={{ width: `${Math.min(100, progress)}%` }} />
        </div>
      ) : null}
    </motion.div>
  );
};

export const EmptyState = ({ icon: Icon, title = 'Nothing here yet', description, action, className = '' }) => (
  <div className={`flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center ${className}`}>
    {Icon ? (
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
        <Icon size={22} />
      </span>
    ) : null}
    <div>
      <p className="text-sm font-bold text-deepNavy font-jost">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-sm text-xs text-slate-500">{description}</p> : null}
    </div>
    {action}
  </div>
);

export const InfoRow = ({ label, value, className = '' }) => (
  <div className={`flex items-start justify-between gap-3 py-2 ${className}`}>
    <span className="text-[11px] font-medium text-slate-500">{label}</span>
    <span className="text-right text-[11px] font-bold text-deepNavy">{value ?? '—'}</span>
  </div>
);

export const MetricPill = ({ label, value, tone = 'slate' }) => {
  const tones = {
    slate: 'bg-slate-50 border-slate-200 text-slate-700',
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    amber: 'bg-amber-50 border-amber-200 text-amber-700',
    red: 'bg-red-50 border-red-200 text-red-700',
    ai: 'bg-ai-50 border-ai-200 text-ai-700'
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[10px] font-bold ${tones[tone]}`}>
      {label}
      <span className="tabular">{value}</span>
    </span>
  );
};

export default StatCard;
