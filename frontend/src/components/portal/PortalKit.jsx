import { differenceInCalendarDays, format, isValid, parseISO } from 'date-fns';

export const inr = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const asDate = (value) => {
  if (!value) return null;
  const date = typeof value === 'string' ? parseISO(value) : new Date(value);
  return isValid(date) ? date : null;
};

export const formatDay = (value, pattern = 'd MMM yyyy') => {
  const date = asDate(value);
  return date ? format(date, pattern) : '—';
};

export const daysUntil = (value) => {
  const date = asDate(value);
  if (!date) return null;
  return differenceInCalendarDays(date, new Date());
};

export const dueLabel = (value) => {
  const days = daysUntil(value);
  if (days === null) return '—';
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `${days}d left`;
};

const TONES = {
  teal: 'bg-teal-50 text-teal-700',
  blue: 'bg-blue-50 text-brandBlue',
  indigo: 'bg-indigo-50 text-indigo-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  sky: 'bg-sky-50 text-sky-700',
  orange: 'bg-orange-50 text-orange-700',
  slate: 'bg-slate-100 text-slate-700'
};

export const SectionCard = ({
  title,
  description,
  icon: Icon,
  tone = 'teal',
  action,
  children,
  className = '',
  bodyClassName = 'p-4',
  as: Tag = 'section'
}) => (
  <Tag className={`overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs ${className}`}>
    {title || action ? (
      <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-3.5 py-2.5 sm:px-4 sm:py-3">
        <div className="flex min-w-0 items-start gap-2.5">
          {Icon ? (
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${TONES[tone] || TONES.teal}`}>
              <Icon size={15} />
            </span>
          ) : null}
          <div className="min-w-0">
            <h2 className="truncate text-[14px] font-extrabold leading-tight text-deepNavy font-jost sm:text-[15px]">{title}</h2>
            {description ? <p className="mt-0.5 text-[10px] leading-snug text-slate-500 sm:text-[11px]">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
    ) : null}
    <div className={bodyClassName}>{children}</div>
  </Tag>
);

export const SoftStat = ({ label, value, hint, icon: Icon, tone = 'teal' }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      {Icon ? (
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${TONES[tone] || TONES.teal}`}>
          <Icon size={13} />
        </span>
      ) : null}
    </div>
    <p className="mt-1.5 text-xl font-extrabold leading-none text-deepNavy font-jost tabular">{value}</p>
    {hint ? <p className="mt-1 text-[9px] font-semibold text-slate-500">{hint}</p> : null}
  </div>
);

export const FilterChips = ({ options = [], value, onChange, tone = 'teal' }) => {
  const activeClass = {
    teal: 'bg-teal-700 text-white',
    blue: 'bg-brandBlue text-white',
    indigo: 'bg-indigo-600 text-white',
    violet: 'bg-violet-600 text-white'
  };
  return (
    <div className="flex flex-wrap items-center gap-1">
      {options.map((option) => (
        <button
          key={option.id}
          onClick={() => onChange(option.id)}
          className={`rounded-lg px-2.5 py-1.5 text-[10px] font-bold transition-colors ${
            value === option.id
              ? activeClass[tone] || activeClass.teal
              : 'border border-slate-200 bg-white text-slate-500 hover:text-deepNavy'
          }`}
        >
          {option.label}
          {typeof option.count === 'number' ? <span className="ml-1 opacity-70">{option.count}</span> : null}
        </button>
      ))}
    </div>
  );
};

export const FormField = ({ label, hint, children, className = '' }) => (
  <label className={`block ${className}`}>
    <span className="text-[8px] font-bold uppercase tracking-wide text-slate-500">{label}</span>
    {children}
    {hint ? <span className="mt-0.5 block text-[8px] font-medium text-slate-500">{hint}</span> : null}
  </label>
);

export const inputClass =
  'mt-0.5 w-full rounded-lg border border-slate-200 bg-slate-50/60 px-2.5 py-2 text-[10.5px] font-semibold text-deepNavy placeholder:text-slate-400 focus:border-teal-300 focus:outline-none focus:ring-2 focus:ring-teal-100';

export default SectionCard;
