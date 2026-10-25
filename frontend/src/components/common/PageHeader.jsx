export const PageHeader = ({ eyebrow, title, description, actions, icon: Icon, tone = 'blue', className = '' }) => {
  const tones = {
    blue: 'bg-blue-50 text-brandBlue',
    teal: 'bg-teal-50 text-teal-700',
    indigo: 'bg-indigo-50 text-indigo-700',
    violet: 'bg-violet-50 text-violet-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    orange: 'bg-orange-50 text-orange-700',
    rose: 'bg-rose-50 text-rose-700',
    sky: 'bg-sky-50 text-sky-700',
    slate: 'bg-slate-100 text-slate-700'
  };
  return (
    <div className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {Icon ? (
          <span className={`hidden h-11 w-11 shrink-0 place-items-center rounded-2xl sm:grid ${tones[tone]}`}>
            <Icon size={20} />
          </span>
        ) : null}
        <div>
          {eyebrow ? (
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-600">{eyebrow}</p>
          ) : null}
          <h1 className="text-2xl font-extrabold tracking-tight text-deepNavy font-jost sm:text-[28px]">{title}</h1>
          {description ? <p className="mt-1 max-w-2xl text-xs text-slate-500">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
};

export const SectionTitle = ({ title, description, action, icon: Icon, className = '' }) => (
  <div className={`flex items-end justify-between gap-3 ${className}`}>
    <div>
      <div className="flex items-center gap-2">
        {Icon ? <Icon size={15} className="text-brandBlue" /> : null}
        <h2 className="text-lg font-extrabold text-deepNavy font-jost">{title}</h2>
      </div>
      {description ? <p className="mt-0.5 text-xs text-slate-500">{description}</p> : null}
    </div>
    {action}
  </div>
);

export default PageHeader;
