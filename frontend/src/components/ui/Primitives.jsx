export const Avatar = ({ name = 'AmyLearn User', src, size = 'md', tone = 'blue', className = '' }) => {
  const sizes = {
    xs: 'h-6 w-6 text-[9px]',
    sm: 'h-8 w-8 text-[10px]',
    md: 'h-10 w-10 text-xs',
    lg: 'h-12 w-12 text-sm',
    xl: 'h-16 w-16 text-lg'
  };
  const tones = {
    blue: 'bg-blue-100 text-blue-700',
    teal: 'bg-teal-100 text-teal-800',
    indigo: 'bg-indigo-100 text-indigo-700',
    violet: 'bg-violet-100 text-violet-700',
    slate: 'bg-slate-100 text-slate-700',
    ai: 'bg-ai-100 text-ai-700'
  };
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();

  if (src) {
    return <img src={src} alt={name} className={`rounded-full object-cover ${sizes[size]} ${className}`} />;
  }
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full font-bold font-jost ${sizes[size]} ${tones[tone] || tones.blue} ${className}`}
      aria-label={name}
    >
      {initials || 'AL'}
    </span>
  );
};

export const Progress = ({ value = 0, tone = 'blue', label, sublabel, className = '', thickness = 'h-1.5' }) => {
  const tones = {
    blue: 'bg-brandBlue',
    teal: 'bg-teal-600',
    indigo: 'bg-indigo-600',
    violet: 'bg-violet-600',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    ai: 'bg-gradient-to-r from-ai-500 to-ai-300'
  };
  const clamped = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={className}>
      {label || sublabel ? (
        <div className="mb-1.5 flex items-center justify-between gap-2">
          <span className="text-[11px] font-semibold text-slate-600">{label}</span>
          <span className="text-[10px] font-bold text-slate-500 tabular">{sublabel || `${clamped}%`}</span>
        </div>
      ) : null}
      <div className={`w-full overflow-hidden rounded-full bg-slate-100 ${thickness}`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ${tones[tone] || tones.blue}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

const SEARCH_FOCUS = {
  slate: 'focus:border-slate-400 focus:ring-slate-100',
  blue: 'focus:border-blue-400 focus:ring-blue-100',
  teal: 'focus:border-teal-400 focus:ring-teal-100',
  indigo: 'focus:border-indigo-400 focus:ring-indigo-100',
  violet: 'focus:border-violet-400 focus:ring-violet-100'
};

export const SearchInput = ({ value, onChange, placeholder = 'Search…', className = '', tone = 'slate' }) => (
  <label className={`relative flex items-center ${className}`}>
    <span className="material-symbols-outlined pointer-events-none absolute left-3 text-[18px] text-slate-400">
      search
    </span>
    <input
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-deepNavy placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
        SEARCH_FOCUS[tone] || SEARCH_FOCUS.slate
      }`}
    />
  </label>
);

const TOGGLE_ON = {
  blue: 'bg-brandBlue',
  teal: 'bg-teal-600',
  indigo: 'bg-indigo-600',
  violet: 'bg-violet-600'
};

export const Toggle = ({ checked, onChange, label, tone = 'blue' }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    onClick={() => onChange?.(!checked)}
    className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? TOGGLE_ON[tone] || TOGGLE_ON.blue : 'bg-slate-200'}`}
  >
    <span
      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
        checked ? 'translate-x-[22px]' : 'translate-x-0.5'
      }`}
    />
  </button>
);

export const Divider = ({ className = '' }) => <div className={`h-px w-full bg-slate-100 ${className}`} />;

export const MetricDelta = ({ value, suffix = 'vs last term' }) => {
  const positive = Number(value) >= 0;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
        positive ? 'text-emerald-700' : 'text-red-700'
      }`}
    >
      <span className="material-symbols-outlined text-[14px]">{positive ? 'trending_up' : 'trending_down'}</span>
      {positive ? '+' : ''}
      {value}% <span className="font-medium text-slate-500">{suffix}</span>
    </span>
  );
};
