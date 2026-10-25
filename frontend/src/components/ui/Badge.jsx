const TONES = {
  slate: 'bg-slate-100 text-slate-700 border-slate-200',
  blue: 'bg-blue-50 text-blue-700 border-blue-200',
  teal: 'bg-teal-50 text-teal-700 border-teal-200',
  indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  violet: 'bg-violet-50 text-violet-700 border-violet-200',
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  orange: 'bg-orange-50 text-orange-700 border-orange-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  pink: 'bg-pink-50 text-pink-700 border-pink-200',
  ai: 'bg-ai-50 text-ai-700 border-ai-200'
};

export const Badge = ({ children, tone = 'slate', dot = false, className = '', mono = false }) => (
  <span
    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold ${
      mono ? 'font-mono' : ''
    } ${TONES[tone] || TONES.slate} ${className}`}
  >
    {dot ? <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" /> : null}
    {children}
  </span>
);

export const StatusBadge = ({ status, className = '' }) => {
  const value = String(status || '').toLowerCase();
  const tone =
    value.includes('active') || value.includes('approved') || value.includes('paid') || value.includes('present') || value.includes('published') || value.includes('completed')
      ? 'emerald'
      : value.includes('pending') || value.includes('upcoming') || value.includes('late') || value.includes('issued')
        ? 'amber'
        : value.includes('reject') || value.includes('overdue') || value.includes('absent') || value.includes('lost') || value.includes('suspended')
          ? 'red'
          : 'slate';
  return (
    <Badge tone={tone} dot className={className}>
      {status || '—'}
    </Badge>
  );
};

export default Badge;
