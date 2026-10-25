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
  if (days < 0) return `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue`;
  if (days === 0) return 'Due today';
  if (days === 1) return 'Due tomorrow';
  return `Due in ${days} days`;
};

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-700',
  blue: 'bg-blue-50 text-brandBlue',
  teal: 'bg-teal-50 text-teal-700',
  violet: 'bg-violet-50 text-violet-700',
  emerald: 'bg-emerald-50 text-emerald-700',
  amber: 'bg-amber-50 text-amber-700',
  rose: 'bg-rose-50 text-rose-700',
  sky: 'bg-sky-50 text-sky-700',
  slate: 'bg-slate-100 text-slate-700'
};

export const SectionCard = ({
  title,
  description,
  icon: Icon,
  tone = 'indigo',
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
            <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${TONES[tone] || TONES.indigo}`}>
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

export const SoftStat = ({ label, value, hint, icon: Icon, tone = 'indigo' }) => (
  <div className="rounded-2xl border border-slate-200/80 bg-white p-3 shadow-2xs">
    <div className="flex items-start justify-between gap-2">
      <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-slate-500">{label}</p>
      {Icon ? (
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${TONES[tone] || TONES.indigo}`}>
          <Icon size={13} />
        </span>
      ) : null}
    </div>
    <p className="mt-1.5 text-xl font-extrabold leading-none text-deepNavy font-jost tabular">{value}</p>
    {hint ? <p className="mt-1 text-[9px] font-semibold text-slate-500">{hint}</p> : null}
  </div>
);

export const RowItem = ({ children, className = '' }) => (
  <div className={`flex items-center justify-between gap-3 border-b border-slate-50 py-2 last:border-0 ${className}`}>
    {children}
  </div>
);

export const TinyDot = ({ tone = 'indigo' }) => {
  const colors = {
    indigo: 'bg-indigo-500',
    blue: 'bg-brandBlue',
    teal: 'bg-teal-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    rose: 'bg-rose-500',
    sky: 'bg-sky-500'
  };
  return <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${colors[tone] || colors.indigo}`} />;
};

export default SectionCard;
